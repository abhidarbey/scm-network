/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/* global getParticipantRegistry getAssetRegistry getFactory */

/**
 * A shipment has been received by an buyer
 * @param {org.blackbear.ShipmentReceived} shipmentReceived - the ShipmentReceived transaction
 * @transaction
 */
async function payOut(shipmentReceived) {  // eslint-disable-line no-unused-vars

    const contract = shipmentReceived.shipment.contract;
    const shipment = shipmentReceived.shipment;
    let payOut = contract.unitPrice * contract.unitCount;

    console.log('Received at: ' + shipmentReceived.timestamp);
    console.log('Contract arrivalDateTime: ' + contract.arrivalDateTime);

    // set the status of the shipment
    shipment.shipmentStatus = 'DELIVERED';
    contract.shipmentStatus = 'DELIVERED';

    // find the lowest temperature reading
        if (shipment.temperatureReadings) {
            // sort the temperatureReadings by centigrade
            shipment.temperatureReadings.sort(function (a, b) {
                return (a.centigrade - b.centigrade);
            });
            const lowestReading = shipment.temperatureReadings[0];
            const highestReading = shipment.temperatureReadings[shipment.temperatureReadings.length - 1];
            let penalty = 0;
            console.log('Lowest temp reading: ' + lowestReading.centigrade);
            console.log('Highest temp reading: ' + highestReading.centigrade);

            // does the lowest temperature violate the contract?
            if (lowestReading.centigrade < contract.minTemperature) {
                penalty += (contract.minTemperature - lowestReading.centigrade) * contract.minPenaltyFactor;
                console.log('Min temp penalty: ' + penalty);
            }

            // does the highest temperature violate the contract?
            if (highestReading.centigrade > contract.maxTemperature) {
                penalty += (highestReading.centigrade - contract.maxTemperature) * contract.maxPenaltyFactor;
                console.log('Max temp penalty: ' + penalty);
            }

            // apply any penalities
            payOut -= (penalty * contract.unitCount);

            if (payOut < 0) {
                payOut = 0;
            }
        }
    

    console.log('Payout: ' + payOut);
    contract.seller.accountBalance += payOut;
    contract.buyer.debtBalance += payOut + payOut * 0.1;
    contract.funder.accountBalance -= payOut;
    contract.funder.assetBalance += payOut + payOut * 0.1;

    console.log('Seller: ' + contract.seller.$identifier + ' new balance: ' + contract.seller.accountBalance);
    console.log('Buyer: ' + contract.buyer.$identifier + ' new debt balance: ' + contract.buyer.debtBalance);
    console.log('Funder: ' + contract.funder.$identifier + ' new balance: ' + contract.funder.accountBalance);
    console.log('Funder: ' + contract.funder.$identifier + ' new balance: ' + contract.funder.assetBalance);

    contract.products.forEach(function(item) {
        contract.buyer.products.push(item);
    });
    
    // update the seller's balance
    const sellerRegistry = await getParticipantRegistry('org.blackbear.Seller');
    await sellerRegistry.update(contract.seller);

    // update the buyer's balance
    const buyerRegistry = await getParticipantRegistry('org.blackbear.Buyer');
    await buyerRegistry.update(contract.buyer);
  
    // update the funder's balance
    const funderRegistry = await getParticipantRegistry('org.blackbear.Funder');
    await funderRegistry.update(contract.funder);

    // update the state of the shipment
    const shipmentRegistry = await getAssetRegistry('org.blackbear.Shipment');
    await shipmentRegistry.update(shipment);
  
    // update the state of the contract
    const contractRegistry = await getAssetRegistry('org.blackbear.Contract');
    await contractRegistry.update(contract);
}

/**
 * Create new product listing contrat for the list of prodcuts
 * @param {org.blackbear.CreateProductList} createProductList
 * @transaction
 */
function createProductList(listing) {
    if(listing.products==null || listing.products.length==0){
      throw new Error('Product list Empty!!');
    }
    var factory = getFactory();
    const NS = 'org.blackbear';
    var productListing = factory.newResource(NS, 'ProductList',Math.random().toString(36).substring(3));
    productListing.seller=listing.seller;
    productListing.products=[];
  	listing.products.forEach(function (item) {
   		  var prodInfo = item.split(',');
        var product = factory.newConcept(NS, 'Product');
        product.productId=prodInfo[0];
        if(prodInfo.length>1){
          product.quantity=prodInfo[1];
          product.price = prodInfo[2];
        }else{
          product.quantity='1';
          product.price = '1';
        }
        productListing.products.push(product);
	  });
    return  getAssetRegistry('org.blackbear.ProductList')
            .then(function(listingRegistry) {
              return listingRegistry.add(productListing);
            });
}

/**
 * Create new purchase order contrat for the list of prodcuts
 * @param {org.blackbear.PurchaseOrder} po
 * @transaction
 */
function po(po) {
    if(po.products==null || po.products.length==0){
      throw new Error('Product list Empty!!');
    }
    const factory = getFactory();
    const NS = 'org.blackbear';
    const contract = factory.newResource(NS, 'Contract',Math.random().toString(36).substring(3));
    contract.seller=po.seller;
    contract.buyer=po.buyer;
    contract.funder=po.funder;
    contract.shipmentStatus = 'PENDING';
    contract.invoiceStatus = 'PENDING';
    contract.fundingStatus = po.fundingStatus;
    const tomorrow = po.timestamp;
    tomorrow.setDate(tomorrow.getDate() + 1);
    contract.arrivalDateTime = tomorrow; // the shipment has to arrive tomorrow
    contract.unitCount = po.unitCount;
    contract.unitPrice = po.unitPrice;
    contract.products=[];
  	po.products.forEach(function (item) {
   		  var prodInfo = item.split(',');
        var product = factory.newConcept(NS, 'Product');
        product.productId=prodInfo[0];
        if(prodInfo.length>1){
          product.quantity=prodInfo[1];
          product.price = prodInfo[2];
        }else{
          product.quantity='1';
          product.price = '1';
        }
        contract.products.push(product);
      });
      contract.minTemperature = po.minTemperature; // min temperature for the cargo
      contract.maxTemperature = po.maxTemperature; // max temperature for the cargo
      contract.minPenaltyFactor = po.minPenaltyFactor;
      contract.maxPenaltyFactor = po.maxPenaltyFactor;
    return  getAssetRegistry('org.blackbear.Contract')
            .then(function(poRegistry) {
              return poRegistry.add(contract);
            });
}

/**
 * An invoice has been updated by the seller
 * @param {org.blackbear.InvoiceUpdate} invoiceUpdate - the InvoiceUpdate transaction
 * @transaction
 */
async function invoiceUpdate(invoiceUpdate) {
    const factory = getFactory();
    const NS = 'org.blackbear';
    const invoice = factory.newResource(NS, 'Invoice',Math.random().toString(36).substring(3));
    const contract = invoiceUpdate.contract;

    invoice.seller = invoiceUpdate.seller;
    invoice.contract = invoiceUpdate.contract;
    invoice.invoiceStatus = 'GENERATED'

    // set the status of the contract
    contract.invoiceStatus = 'GENERATED';

    // update the state of the contract
    const contractRegistry = await getAssetRegistry('org.blackbear.Contract');
    await contractRegistry.update(contract);

    return  getAssetRegistry('org.blackbear.Invoice')
            .then(function(invoiceRegistry) {
              return invoiceRegistry.add(invoice);
            });
}

/**
 * An invoice has been updated by the seller
 * @param {org.blackbear.CreateShipment} createShipment - the CreateShipment transaction
 * @transaction
 */
async function createShipment(createShipment) {
    const factory = getFactory();
    const NS = 'org.blackbear';
    const shipment = factory.newResource(NS, 'Shipment',Math.random().toString(36).substring(3));
    const contract = createShipment.contract;

    shipment.shipper = createShipment.shipper;
    shipment.contract = createShipment.contract;
    shipment.shipmentStatus = 'IN_TRANSIT'

    // set the status of the contract
    contract.shipmentStatus = 'IN_TRANSIT';

    // update the state of the contract
    const contractRegistry = await getAssetRegistry('org.blackbear.Contract');
    await contractRegistry.update(contract);

    return  getAssetRegistry('org.blackbear.Shipment')
            .then(function(shipmentRegistry) {
              return shipmentRegistry.add(shipment);
            });
}

/**
 * Funding Approval
 * @param {org.blackbear.FundsApproval} fundsApproval - the FundsApproval transaction
 * @transaction
 */
async function fundsApproval(fundsApproval) {
    const contract = fundsApproval.contract;

    // set the status of the contract
    contract.fundingStatus = 'APPROVED';

    // update the state of the contract
    const contractRegistry = await getAssetRegistry('org.blackbear.Contract');
    await contractRegistry.update(contract);
}

/**
 * A temperature reading has been received for a shipment
 * @param {org.blackbear.TemperatureReading} temperatureReading - the TemperatureReading transaction
 * @transaction
 */
async function temperatureReading(temperatureReading) {  // eslint-disable-line no-unused-vars

    const shipment = temperatureReading.shipment;

    console.log('Adding temperature ' + temperatureReading.centigrade + ' to shipment ' + shipment.$identifier);

    if (shipment.temperatureReadings) {
        shipment.temperatureReadings.push(temperatureReading);
    } else {
        shipment.temperatureReadings = [temperatureReading];
    }

    // add the temp reading to the shipment
    const shipmentRegistry = await getAssetRegistry('org.blackbear.Shipment');
    await shipmentRegistry.update(shipment);
}
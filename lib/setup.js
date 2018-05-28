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
/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.blackbear.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const NS = 'org.blackbear';

    // create the seller
    const seller = factory.newResource(NS, 'Seller', 'farmer');
    const sellerAddress = factory.newConcept(NS, 'Address');
    sellerAddress.country = 'India';
    seller.address = sellerAddress;
    seller.accountBalance = 10000;
    seller.debtBalance = 0;

    // create the buyer
    const buyer = factory.newResource(NS, 'Buyer', 'supermarket');
    const buyerAddress = factory.newConcept(NS, 'Address');
    buyerAddress.country = 'India';
    buyer.address = buyerAddress;
    buyer.accountBalance = 10000;
    buyer.debtBalance = 0;
    buyer.products = [];

    // create the shipper
    const shipper = factory.newResource(NS, 'Shipper', 'shipper');
    const shipperAddress = factory.newConcept(NS, 'Address');
    shipperAddress.country = 'India';
    shipper.address = shipperAddress;
    shipper.accountBalance = 10000;
    shipper.debtBalance = 0;

    // create the funder
    const funder = factory.newResource(NS, 'Funder', 'bank');
    const funderAddress = factory.newConcept(NS, 'Address');
    funderAddress.country = 'India';
    funder.address = funderAddress;
    funder.accountBalance = 10000000;
    funder.debtBalance = 0;
    funder.assetBalance = 0;
  
  
    // add the sellers
    const sellerRegistry = await getParticipantRegistry(NS + '.Seller');
    await sellerRegistry.addAll([seller]);

    // add the buyers
    const buyerRegistry = await getParticipantRegistry(NS + '.Buyer');
    await buyerRegistry.addAll([buyer]);

    // add the shippers
    const shipperRegistry = await getParticipantRegistry(NS + '.Shipper');
    await shipperRegistry.addAll([shipper]);

    // add the funders
    const funderRegistry = await getParticipantRegistry(NS + '.Funder');
    await funderRegistry.addAll([funder]);
}
# scm-network

Blackbear - A Supply Chain Management Business Network

> Example business network that shows sellers, buyers, shippers and funders defining contracts for the supply chain finance and the price of goods, based on temperature readings received for shipping containers.

>Go to the link https://composer-playground.mybluemix.net/ and upload the scm-network@0.0.1.bna file and depoly it.

The business network defines a contract between sellers and buyers. The contract stipulates that: On receipt of the shipment the buyer pays the seller the unit price x the number of units in the shipment. Shipments that have breached the low temperate threshold have a penalty applied proportional to the magnitude of the breach x a penalty factor. Shipments that have breached the high temperate threshold have a penalty applied proportional to the magnitude of the breach x a penalty factor.

This business network defines:

**Participants**
`Seller` `Buyerer` `Shipper` `Funder`

**Assets**
`Contract` `ProductList` `Invoice` `Shipment` 

**Transactions**
`CreateProductList` `PurchaseOrder` `InvoiceUpdate` `FundsApproval` `TemperatureReading` `ShipmentReceived` `SetupDemo`

To test this Business Network Definition in the **Test** tab:

Submit a `SetupDemo` transaction:

```
{
  "$class": "org.blackbear.SetupDemo"
}
```

This transaction populates the Participant Registries with a `Seller`, a `Buyer`, a `Funder` and a `Shipper`.

Submit a `CreateProductList` transaction. This will create a product list in ProductList asset.

```
{
  "$class": "org.blackbear.CreateProductList",
  "products": ["prodA", "prodB", "prodC"],
  "seller": "resource:org.blackbear.Seller#farmer"
}
```

Submit a `PurchaseOrder` transaction. This transaction will create a contract in the Contract asset.
>Click on the options for the optional properties to set the temperature parameters and the penalty factor. This will also require to submit the `TemperatureReading` transaction after the creation of the shipment.

```
{
  "$class": "org.blackbear.PurchaseOrder",
  "products": ["prodA", "prodB", "prodC"],
  "unitCount": 5000,
  "unitPrice": 1,
  "fundingStatus": "PLACED",
  "buyer": "resource:org.blackbear.Buyer#supermarket",
  "seller": "resource:org.blackbear.Seller#farmer",
  "funder": "resource:org.blackbear.Funder#bank"
}
```

After receving the purchase order request, the seller will update the invoice. This transaction will update the contract. The field invoiceStatus will be updated from 'PENDING' to 'GENERATED'.

Submit an `InvoiceUpdate` transaction:

```
{
  "$class": "org.blackbear.InvoiceUpdate",
  "seller": "resource:org.blackbear.Seller#farmer",
  "contract": "resource:org.blackbear.Contract#contract_id"
}
```

The bank will then review the Contract and Invoice and will approve the funding. This transaction will update the contract. The field fundingStatus will be updated from 'PLACED' to 'APPROVED'.

Submit a `FundsApproval` transaction:

```
{
  "$class": "org.blackbear.FundsApproval",
  "funder": "resource:org.blackbear.Funder#bank",
  "invoice": "resource:org.blackbear.Invoice#invoice_id",
  "contract": "resource:org.blackbear.Contract#contract_id"
}
```

After receving the approval of funding, the seller will create the shipment. This transaction will update the contract. The field shipmentStatus will be updated from 'PENDING' to 'IN_TRANSIT'.

Submit a `CreateShipment` transaction:

```
{
  "$class": "org.blackbear.CreateShipment",
  "shipper": "resource:org.blackbear.Shipper#shipper",
  "contract": "resource:org.blackbear.Contract#contract_id"
}
```

After receving shipment, the buyer will submit the `ShipmentReceived` transaction. This transaction will update the contract. The field shipmentStatus will be updated from 'IN_TRANSIT' to 'DELIVERED'.

Submit a `ShipmentReceived` transaction for `shipment_id` to trigger the payout to the seller, based on the parameters of the `contract_id` contract:

```
{
  "$class": "org.blackbear.ShipmentReceived",
  "shipment": "resource:org.blackbear.Shipment#shipment_id"
}
```
When the shipment have been received by the buyer, the funder's accountBalance will be deducted by 5000 and its assetBalance will be credited by 5500. At the same time, the seller's accountBalance will be credited by 5000 and the buyer's debtBalance will be credited by 5500.

The buyer's product inventory will also be updated.

Congratulations!

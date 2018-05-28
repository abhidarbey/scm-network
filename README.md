# scm-network

Blackbear - A Supply Chain Management Business Network

> Example business network that shows sellers, buyers, shippers and funders defining contracts for the price of perishable goods, based on temperature readings received for shipping containers.

The business network defines a contract between sellers and buyers. The contract stipulates that: On receipt of the shipment the buyer pays the seller the unit price x the number of units in the shipment. Shipments that have breached the low temperate threshold have a penalty applied proportional to the magnitude of the breach x a penalty factor. Shipments that have breached the high temperate threshold have a penalty applied proportional to the magnitude of the breach x a penalty factor.

This business network defines:

**Participants**
`Seller` `Buyerer` `Shipper` `Funder`

**Assets**
`Contract` `Invoice` `Shipment` 

**Transactions**
`InvoiceUpdate` `FundsApproval` `TemperatureReading` `ShipmentReceived` `SetupDemo`

To test this Business Network Definition in the **Test** tab:

Submit a `SetupDemo` transaction:

```
{
  "$class": "org.blackbear.SetupDemo"
}
```

This transaction populates the Participant Registries with a `Seller`, a `Buyer`, a `Funder` and a `Shipper`. The Asset Registries will have a `Contract` asset.

Create an `Invoice` asset. Set the Seller as farmer, invoiceId as INV_001 and Contract as CON_001. 

Submit an `InvoiceUpdate` transaction:

```
{
  "$class": "org.blackbear.InvoiceUpdate",
  "invoice": "resource:org.blackbear.Invoice#INV_001",
  "contract": "resource:org.blackbear.Contract#CON_001"
}
```

Submit a `FundsApproval` transaction:

```
{
  "$class": "org.blackbear.FundsApproval",
  "invoice": "resource:org.blackbear.Invoice#INV_001",
  "contract": "resource:org.blackbear.Contract#CON_001"
}
```
Create a `Shipment` asset. Set the Shipper as shipper, shipmentId as SHIP_001.

Submit a `TemperatureReading` transaction:

```
{
  "$class": "org.blackbear.TemperatureReading",
  "centigrade": 8,
  "shipment": "resource:org.blackbear.Shipment#SHIP_001"
}
```

If the temperature reading falls outside the min/max range of the contract, the price received by the grower will be reduced. You may submit several readings if you wish. Each reading will be aggregated within `SHIP_001` Shipment Asset Registry.

Submit a `ShipmentReceived` transaction for `SHIP_001` to trigger the payout to the grower, based on the parameters of the `CON_001` contract:

```
{
  "$class": "org.blackbear.ShipmentReceived",
  "shipment": "resource:org.blackbear.Shipment#SHIP_001"
}
```
When the shipment have been received by the buyer, the funder's accountBalance will be deducted by 2500 and its assetBalance will be credited by 2750. At the same time, the seller's accountBalance will be credited by 2500 and the buyer's debtBalance will be credited by 2750.

Congratulations!

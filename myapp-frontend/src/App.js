import React, {useEffect, useState} from "react";
import {object, string, number, date, array} from "yup";

import './App.css';

import API from "./api";


const today = new Date().toISOString().slice(0, 10);

const lineItemSchema = object(
  {
    bill_account_id: string().required().default("300 - Purchases"),
    description: string().default(""),
    discount_rate: number().default(0),
    bill_item_id: number(),
    quantity: number().required().default(1),
    bill_tax_rate_id: string().required().default("Standard_20"),
    unit_amount: number().required().default(1)
  }
);

const invoiceSchema = object({
  bill_account_id: number(),
  currency_id: string().required().default("GBP"),
  due_date: date().required().default(today),
  issue_date: date().required().default(today),
  invoice_number: string().default(""),
  supplier_trading_entity_id: number().required().default(1),
  reference: string().required().default(""),
  bill_tax_rate_id: string().required().default("Standard_20"),
  type: string().required().default("Order"),
  line_items: array().of(lineItemSchema).default([])
});


function InputGroup({children}) {
  return <div className="inputGroup">{children}</div>;
}


function App() {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [company, setCompany] = useState(null);
  const [invoice, setInvoice] = useState(invoiceSchema.getDefault());
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);

  function handleInvoiceChange(name, value) {
    setInvoice({
      ...invoice,
      [name]: value
    })
  }

  function addLineItem() {
    setInvoice({
      ...invoice,
      line_items: [
        ...invoice.line_items,
        lineItemSchema.getDefault()
      ]
    });
  }

  function removeLineItem(index) {
    const lineItems = [...invoice.line_items];
    lineItems.splice(index, 1);
    setInvoice({
      ...invoice,
      line_items: lineItems
    });
  }

  function handleLineItemChange(index, name, value) {
    setInvoice({
      ...invoice,
      line_items: [
        ...invoice.line_items.slice(0, index),
        {
          ...invoice.line_items[index],
          [name]: value
        },
        ...invoice.line_items.slice(index+1)
      ]
    })
  }

  function resetInvoice() {
    setInvoice(invoiceSchema.getDefault());
  }

  function createPurchase() {
    setIsLoading(true);
    API.createPurchase(invoice)
      .then(() => setMessage("Successfully created invoice"))
      .catch(() => setMessage("Failed creating invoice"))
      .finally(() => setIsLoading(false));
  }

  function loadToken() {
    setIsLoading(true);
    API.getToken()
      .then(response => response.text())
      .then(token => {
          setToken(token);
          setIsAuthenticated(true);
        })
      .catch(() => setIsAuthenticated(false))
      .then(loadCompany())
      .finally(() => setIsLoading(false));
  }

  function loadCompany() {
    API.getCurrentCompany().then(response => response.text()).then(setCompany);
  }

  useEffect(loadToken, []);
  useEffect(resetInvoice, []);

  function getStatus() {
    switch (isAuthenticated) {
      case true:
        return "Authenticated";
      case false:
        return "Not authenticated";
      case null:
        return "Loading...";
      default:
        throw new Error("Unexpected value for isAuthenticated")
    }
  }

  
  return (
    <>
      <h1>OAuth authentication</h1>
      <InputGroup>
        <label>Status</label>
        <input name="status" value={getStatus()} readOnly/>
      </InputGroup>
      
      {isAuthenticated === false && <a href={`${process.env.REACT_APP_API_URL}/auth/connect`}>Connect Nook</a>}
      {isAuthenticated && <a href={`${process.env.REACT_APP_API_URL}/auth/disconnect`}>Disconnect Nook</a>}

      <h2>Auth info</h2>
      <form>
        <InputGroup>
          <label className="dBlock">Token</label>
          <textarea name="token" value={token ?? ""} readOnly></textarea>
        </InputGroup>

        <InputGroup>
          <label className="dBlock">Current company info</label>
          <textarea name="company" value={company ?? ""} readOnly></textarea>
        </InputGroup>
      </form>

      <h2>Create invoice</h2>
      <form>
        <InputGroup>
          <label>Supplier trading entity ID</label>
          <input type="number" value={invoice.supplier_trading_entity_id} onChange={e => handleInvoiceChange("supplier_trading_entity_id", e.target.value)}/>
        </InputGroup>

        <InputGroup>
          <label>Due date</label>
          <input type="date" value={invoice.due_date} onChange={e => handleInvoiceChange("due_date", e.target.value)}/>
        </InputGroup>

        <InputGroup>
          <label>Issue date</label>
          <input type="date" value={invoice.issue_date} onChange={e => handleInvoiceChange("issue_date", e.target.value)}/>
        </InputGroup>

        <InputGroup>
          <label>Invoice number</label>
          <input type="text" value={invoice.invoice_number} onChange={e => handleInvoiceChange("invoice_number", e.target.value)}/>
        </InputGroup>

        <InputGroup>
          <label>Reference</label>
          <input type="text" value={invoice.reference} onChange={e => handleInvoiceChange("reference", e.target.value)}/>
        </InputGroup>

        <InputGroup>
          <label>Tax rate</label>
          <input type="text" value={invoice.bill_tax_rate_id} onChange={e => handleInvoiceChange("bill_tax_rate_id", e.target.value)}/>
        </InputGroup>

        <InputGroup>
          <h3>Line items</h3>
          {
            invoice.line_items.map((line_item, i) => <>
              <div key={`${invoice.line_items.length}-${i}`} style={{border: "1px solid grey"}}>
                <InputGroup>
                  <label>Account</label>
                  <input type="text" value={line_item.bill_account_id} onChange={e => handleLineItemChange(i, "bill_account_id", e.target.value)}/>
                </InputGroup>

                <InputGroup>
                  <label>Description</label>
                  <input type="text" value={line_item.description} onChange={e => handleLineItemChange(i, "description", e.target.value)}/>
                </InputGroup>

                <InputGroup>
                  <label>Quantity</label>
                  <input type="number" step="1" value={line_item.quantity} onChange={e => handleLineItemChange(i, "quantity", e.target.value)}/>
                </InputGroup>

                <InputGroup>
                  <label>Tax rate</label>
                  <input type="text" value={line_item.bill_tax_rate_id} onChange={e => handleLineItemChange(i, "bill_tax_rate_id", e.target.value)}/>
                </InputGroup>

                <InputGroup>
                  <label>Amount</label>
                  <input type="number" step="1" value={line_item.unit_amount} onChange={e => handleLineItemChange(i, "unit_amount", e.target.value)}/>
                </InputGroup>

                <button type="button" onClick={() => removeLineItem(i)}>Remove line item</button>
              </div>
            </>)
          }
          <button type="button" onClick={addLineItem}>Add line item</button>
        </InputGroup>
        
        <button type="button" onClick={createPurchase} disabled={isLoading || !isAuthenticated}>Create purchase</button>

        {
          message && <p style={{fontWeight: "bold"}}>{message}</p>
        }
      </form>
    </>
  );
}

export default App;

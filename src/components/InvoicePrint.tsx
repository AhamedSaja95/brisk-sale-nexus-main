import { Invoice } from "@/types";

interface InvoicePrintProps {
  invoice: Invoice;
}

const InvoicePrint = ({ invoice }: InvoicePrintProps) => {
  return (
    <div
      className="bg-white p-4 max-w-md mx-auto font-mono text-sm"
      id="print-area"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-medium uppercase mb-0">SUN TRADERS</h2>
        <p className="mb-0">Dedicated Economic Center</p>
        <p className="mb-0">Wellisara.</p>
        <p className="mb-0">Tel: 0112935473</p>
      </div>

      {/* Separator */}
      <div className="my-2 border-t border-dashed border-gray-400"></div>

      {/* Invoice Info */}
      <div className="flex ">
        <div>
          <p className="mb-0">
            {new Date(invoice.date)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .replace(/\//g, "/")}{" "}
            {new Date(invoice.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
        <div>
          <p className="mb-0 ml-4"> INV:{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Customer Name */}
      <p className="mb-0">Customer Name {invoice.customerName || ""}</p>

      {/* Separator */}
      <div className="my-2 border-t border-dashed border-gray-400"></div>

      {/* Column Headers */}
      <div className="flex justify-between mb-1">
        <div className="w-1/3">PRICE</div>
        <div className="w-1/6 text-center">DIS</div>
        <div className="w-1/6 text-center">QTY</div>
        <div className="w-1/3 text-right">AMOUNT</div>
      </div>

      {/* Separator */}
      <div className="my-1 border-t border-dashed border-gray-400"></div>

      {/* Invoice Items */}
      {invoice.items.map((item, index) => (
        <div key={index}>
          <div className="mb-0">
            <p className="font-medium mb-0">{item.product.description}</p>
          </div>
          <div className="flex justify-between mb-2">
            <div className="w-1/3 ml-3">{item.product.price.toFixed(2)}</div>
            <div className="w-1/6 text-center">{item.discount.toFixed(2)}</div>
            <div className="w-1/6 text-center">{item.quantity}</div>
            <div className="w-1/3 text-right">{item.amount.toFixed(2)}</div>
          </div>
        </div>
      ))}

      {/* Separator */}
      <div className="my-2 border-t border-dashed border-gray-400"></div>

      {/* Totals */}
      <div className="flex justify-between mb-0">
        <div className="text-right font-medium w-1/2">TOTAL :</div>
        <div className="w-1/2 text-right">{invoice.totalAmount.toFixed(2)}</div>
      </div>

      {/* Separator */}
      {/* <div className="my-2 border-t border-dashed border-gray-400"></div> */}
      <div className="flex justify-between mb-0">
        <div className="text-right font-medium w-1/2"></div>
        <div className="w-1/2 text-center overflow-hidden whitespace-nowrap overflow-hidden ">
          =====================================
        </div>
      </div>

      {/* Payment Info */}
      <div className="flex justify-between mb-0">
        <div className="text-right font-medium w-1/2">CASH :</div>
        <div className="w-1/2 text-right">{invoice.cashAmount.toFixed(2)}</div>
      </div>
      <div className="flex justify-between mb-0">
        <div className="text-right font-medium w-1/2">BALANCE :</div>
        <div className="w-1/2 text-right">
          {invoice.balanceAmount.toFixed(2)}
        </div>
      </div>

      {/* Separator */}
      <div className="my-2 border-t border-dashed border-gray-400"></div>
      

      {/* Footer */}
      <div className="text-center">
        <p className="mb-0 text-left">
          Number of Items: {invoice.items.length}
        </p>
        <p className="mt-2">THANK YOU COME AGAIN</p>
      </div>
    </div>
  );
};

export default InvoicePrint;

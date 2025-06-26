import { Invoice } from "@/types";

interface InvoicePrintProps {
  invoice: Invoice;
}

const InvoicePrint = ({ invoice }: InvoicePrintProps) => {
  return (
    <div
      className="bg-white p-4 max-w-md mx-auto font-[\'Courier_New\',_Courier,_monospace] text-sm"
      id="print-area"
    >
      {/* Header */}
      <div className="text-center font-bold">
        <h2 className="text-2xl font-bold uppercase mb-0">SUN TRADERS</h2>
        <p className="mb-0">Dedicated Economic Center</p>
        <p className="mb-0">Wellisara.</p>
        <p className="mb-0">Tel: 0112935473</p>
      </div>

      {/* Separator */}
      <div className="my-2 border-t border-dashed border-gray-400"></div>

      {/* Invoice Info */}
      <div className="flex font-bold ">
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
          <p className="mb-0 ml-4 font-bold"> INV:{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Customer Name */}
      <p className="mb-0 font-bold">Customer Name {invoice.customerName || ""}</p>

      {/* Separator */}
      <div className="my-2 border-t border-dashed border-gray-400 font-bold"></div>

      {/* Column Headers */}
      <div className="flex justify-between mb-1 font-bold">
        <div className="w-1/3 text-center">PRICE</div>
        <div className="w-1/6 text-left">DIS</div>
        <div className="w-1/6 text-center">QTY</div>
        <div className="w-1/3 text-right">AMOUNT</div>
      </div>

      {/* Separator */}
      <div className="my-1 border-t border-dashed border-gray-400 font-bold"></div>

      {/* Invoice Items */}
      {invoice.items.map((item, index) => (
        <div key={index} >
          <div className="mb-0">
            <p className="  mb-0 font-bold">{item.product.description}</p>
          </div>
          <div className="flex justify-between mb-2">
            <div className="w-1/3 ml-3 font-bold">{(item.amount / item.quantity).toFixed(2)}</div>
            <div className="w-1/6 text-left font-bold">{item.discount.toFixed(2)}</div>
            <div className="w-1/6 text-center font-bold">{item.quantity}</div>
            <div className="w-1/3 text-right font-bold">{item.amount.toFixed(2)}</div>
          </div>
        </div>
      ))}

      {/* Separator */}
      <div className="my-2 border-t border-dashed border-gray-400 font-bold"></div>

      {/* Totals */}
      <div className="flex justify-between mb-0">
        <div className="text-right   w-1/2 font-bold">TOTAL :</div>
        <div className="w-1/2 text-right font-bold">{invoice.totalAmount.toFixed(2)}</div>
      </div>

      {/* Separator */}
      {/* <div className="my-2 border-t border-dashed border-gray-400"></div> */}
      <div className="flex justify-between mb-0">
        <div className="text-right   w-1/2 font-bold"></div>
        <div className="w-1/2 text-center overflow-hidden whitespace-nowrap overflow-hidden font-bold">
          =====================================
        </div>
      </div>

      {/* Payment Info */}
      <div className="flex justify-between mb-0">
        <div className="text-right   w-1/2 font-bold">CASH :</div>
        <div className="w-1/2 text-right font-bold">{invoice.cashAmount.toFixed(2)}</div>
      </div>
      <div className="flex justify-between mb-0">
        <div className="text-right   w-1/2 font-bold">BALANCE :</div>
        <div className="w-1/2 text-right font-bold">
          {invoice.balanceAmount.toFixed(2)}
        </div>
      </div>

      {/* Separator */}
      <div className="my-2 border-t border-dashed border-gray-400 font-bold"></div>
      

      {/* Footer */}
      <div className="text-center">
        <p className="mb-0 text-left font-bold">
          Number of Items: {invoice.items.length}
        </p>
        <p className="mt-2 font-bold">THANK YOU COME AGAIN</p>
      </div>
    </div>
  );
};

export default InvoicePrint;

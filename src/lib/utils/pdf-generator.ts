import { Item } from "@/types";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";

export const generateBarcodePDF = (item: Item, count: number = 1): string => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const barcodeWidth = 60;
  const barcodeHeight = 25;
  const cols = 3;
  const rows = 8;
  const verticalSpacing = 35;
  const horizontalSpacing = 65;

  let x = margin;
  let y = margin;

  for (let i = 1; i <= count; i++) {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, item.barcode, {
      format: "CODE128",
      width: 1.5,
      height: 30,
      displayValue: true,
      fontSize: 10,
    });

    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", x, y, barcodeWidth, barcodeHeight);

    // Move to next position
    x += horizontalSpacing;
    if (i % cols === 0) {
      x = margin;
      y += verticalSpacing;
      if (i % (cols * rows) === 0 && i < count) {
        doc.addPage();
        x = margin;
        y = margin;
      }
    }
  }

  return doc.output("datauristring"); // returns Base64 PDF preview
};

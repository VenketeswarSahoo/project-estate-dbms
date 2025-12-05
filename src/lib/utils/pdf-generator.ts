import jsPDF from "jspdf";
import "jspdf-autotable";
import { Item } from "@/types";

export const generateBarcodePDF = (item: Item) => {
  const doc = new jsPDF();
  const pieceCount = item.pieces || 1;

  for (let i = 1; i <= pieceCount; i++) {
    if (i > 1) doc.addPage();

    doc.setFontSize(18);
    doc.text("Item Barcode", 14, 22);

    doc.setFontSize(12);
    doc.text(`Name: ${item.name}`, 14, 32);
    doc.text(`UID: ${item.uid}`, 14, 38);

    if (pieceCount > 1) {
      doc.setFontSize(14);
      doc.text(`Piece ${i} of ${pieceCount}`, 14, 95);
    }

    doc.setLineWidth(0.5);
    doc.rect(14, 45, 80, 40);

    doc.setFontSize(10);
    doc.text(item.barcode, 54, 80, { align: "center" });
    doc.setFontSize(14);
    doc.text("|| ||| || ||| ||", 54, 65, { align: "center" });
  }

  doc.save(`${item.uid}-barcode.pdf`);
};

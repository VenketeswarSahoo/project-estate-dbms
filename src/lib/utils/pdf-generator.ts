import { Item } from "@/types";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";

const drawShippingLabel = (doc: jsPDF, item: Item, count: number) => {
  const pageWidth = 4; // inches
  const pageHeight = 6; // inches
  const margin = 0.15;
  const contentWidth = pageWidth - margin * 2;

  for (let i = 1; i <= count; i++) {
    if (i > 1) {
      doc.addPage();
    }

    // --- ZONE 1: HEADER (Indicator & Company) ---
    // 1.1 Indicator Box "E" (Top Left)
    doc.setLineWidth(0.02);
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, margin, 0.75, 0.75);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.text("E", margin + 0.375, margin + 0.55, { align: "center" });

    // 1.2 Company/Service Info (Right of Box)
    const headerTextX = margin + 0.9;
    doc.setFontSize(10);
    doc.text("ONARACH ESTATE APP", headerTextX, margin + 0.2);

    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text(`UID: ${item.uid}`, headerTextX, margin + 0.4);

    const dateStr = new Date().toLocaleDateString();
    doc.text(`DATE: ${dateStr}`, headerTextX, margin + 0.6);

    // --- ZONE 2: BANNER ---
    // Horizontal Double Line
    const bannerY = margin + 0.9;
    doc.setLineWidth(0.04);
    doc.line(margin, bannerY, pageWidth - margin, bannerY);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL INVENTORY", pageWidth / 2, bannerY + 0.3, {
      align: "center",
    });

    doc.setLineWidth(0.01);
    doc.line(margin, bannerY + 0.45, pageWidth - margin, bannerY + 0.45);

    // --- ZONE 3: ADDRESS / ITEM DETAILS ---
    let yPos = bannerY + 0.7;

    // "FROM:" (Static App info)
    // doc.setFontSize(7);
    // doc.setFont("helvetica", "normal");
    // doc.text("FROM:", margin, yPos);
    // doc.setFontSize(9);
    // doc.setFont("helvetica", "bold");
    // doc.text("ONARACH WAREHOUSE", margin + 0.5, yPos);

    // yPos += 0.4;

    // "TO:" (Item Name)
    // doc.setFontSize(8);
    // doc.setFont("helvetica", "normal");
    // doc.text("TO:", margin, yPos);

    // yPos += 0.25;

    // Item Name (Large)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    // Handle multi-line item names
    const nameLines = doc.splitTextToSize(
      item.name.toUpperCase(),
      contentWidth - 0.5
    );
    doc.text(nameLines, margin + 0.3, yPos);

    yPos += nameLines.length * 0.35;

    // Piece Count
    doc.setFontSize(10);
    doc.text(`PIECE ${i} OF ${count}`, margin + 0.3, yPos + 0.2);

    // --- ZONE 4: BARCODE (Bottom) ---
    // Thick separator line at approx 4 inches down
    const barcodeZoneY = 4.0;
    doc.setLineWidth(0.05);
    doc.line(margin, barcodeZoneY, pageWidth - margin, barcodeZoneY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    // doc.text("TRACKING #", margin, barcodeZoneY + 0.2);

    // Generate Barcode Image
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, item.barcode, {
      format: "CODE128",
      width: 4,
      height: 80,
      displayValue: true,
      fontSize: 20,
      textMargin: 5,
      margin: 0,
    });
    const imgData = canvas.toDataURL("image/png");

    const imgProps = (doc as any).getImageProperties(imgData);
    // Fit barcode deeply into the bottom zone
    const maxImgWidth = contentWidth * 0.9;
    const pdfImgWidth = Math.min(contentWidth, maxImgWidth);
    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;
    const xPos = (pageWidth - pdfImgWidth) / 2;
    const yImgPos = barcodeZoneY + 0.4;

    doc.addImage(imgData, "PNG", xPos, yImgPos, pdfImgWidth, pdfImgHeight);

    // Bottom Border line
    doc.setLineWidth(0.01);
    doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);
  }
};

export const generateBarcodePDF = (item: Item, count: number = 1): string => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [4, 6],
  });
  drawShippingLabel(doc, item, count);
  return doc.output("datauristring");
};

export const generateBarcodePDFBlobUrl = (
  item: Item,
  count: number = 1
): string => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [4, 6],
  });
  drawShippingLabel(doc, item, count);
  return doc.output("bloburl");
};

export const generateBarcodeDataUrl = (item: Item): string => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, item.barcode, {
    format: "CODE128",
    width: 3,
    height: 60,
    displayValue: true,
    fontSize: 24,
    textMargin: 5,
    marginTop: 10,
    marginBottom: 10,
  });
  return canvas.toDataURL("image/png");
};

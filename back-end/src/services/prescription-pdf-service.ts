import PDFDocument from 'pdfkit';
import type { PetSpecies, PrescriptionPharmacyType, PrescriptionDocumentType } from '../generated/prisma/client.js';

type PrescriptionPdfData = {
  id: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  prescriptionDocumentType: PrescriptionDocumentType;
  prescriptions: Array<{
    medicineName: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
    routeOfAdministration: string | null;
    pharmacyType: PrescriptionPharmacyType | null;
    quantity: string | null;
  }>;
  veterinarian: {
    name: string;
    crmv: string | null;
    phone: string | null;
  };
  tutor: {
    name: string;
    document: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
  };
  pet: {
    id: string;
    name: string;
    species: PetSpecies;
    breed: string | null;
  };
  clinic: {
    name: string;
    phone: string | null;
  };
};

/** Cor primária do site — oklch(0.84 0.15 75) em front-end/src/index.css */
const BRAND_PRIMARY = '#ffbb49';
const PAGE_MARGIN = 40;

const PET_SPECIES_LABELS: Record<PetSpecies, string> = {
  DOG: 'Cão',
  CAT: 'Gato',
  BIRD: 'Ave',
  RABBIT: 'Coelho',
  RODENT: 'Roedor',
  FERRET: 'Furão',
  REPTILE: 'Réptil',
  FISH: 'Peixe',
  OTHER: 'Outro',
};

const PHARMACY_TYPE_LABELS: Record<PrescriptionPharmacyType, string> = {
  HUMAN: 'Farmácia Humana',
  VETERINARY: 'Farmácia Veterinária',
};

function formatAddress(tutor: PrescriptionPdfData['tutor']) {
  const parts = [
    tutor.street,
    tutor.number ? `nº ${tutor.number}` : null,
    tutor.complement,
    tutor.neighborhood,
    tutor.city && tutor.state ? `${tutor.city}/${tutor.state}` : tutor.city ?? tutor.state,
    tutor.zipCode ? `CEP ${tutor.zipCode}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'Não informado';
}

function formatInstructions(prescription: PrescriptionPdfData['prescriptions'][number]) {
  return [
    prescription.dosage,
    prescription.frequency,
    prescription.duration,
    prescription.instructions,
  ]
    .filter(Boolean)
    .join(' · ');
}

function shortPetId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export class PrescriptionPdfService {
  generate(data: PrescriptionPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const contentWidth = doc.page.width - PAGE_MARGIN * 2;
      const phone = data.veterinarian.phone ?? data.clinic.phone;

      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(BRAND_PRIMARY)
        .text(data.veterinarian.name, PAGE_MARGIN, PAGE_MARGIN, { width: contentWidth * 0.7 });

      if (phone) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#000000')
          .text(`Telefone: ${phone}`, PAGE_MARGIN, PAGE_MARGIN, {
            width: contentWidth,
            align: 'right',
          });
      }

      let y = PAGE_MARGIN + 28;

      if (data.veterinarian.crmv) {
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor(BRAND_PRIMARY)
          .text(data.veterinarian.crmv, PAGE_MARGIN, y);
        y += 18;
      } else {
        y += 4;
      }

      doc
        .moveTo(PAGE_MARGIN, y)
        .lineTo(PAGE_MARGIN + contentWidth, y)
        .strokeColor(BRAND_PRIMARY)
        .lineWidth(1)
        .stroke();

      y += 16;

      const documentTitle =
        data.prescriptionDocumentType === 'SPECIAL_CONTROL'
          ? 'Receita de Controle Especial'
          : 'Receita Veterinária';

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000000')
        .text(documentTitle, PAGE_MARGIN, y, { width: contentWidth * 0.55 });

      doc
        .font('Helvetica')
        .fontSize(9)
        .text('1ª Via para Farmácia — 2ª Via para Paciente', PAGE_MARGIN, y + 2, {
          width: contentWidth,
          align: 'right',
        });

      y += 28;

      const boxGap = 8;
      const boxWidth = (contentWidth - boxGap * 2) / 3;
      const boxHeight = 88;
      const boxTitles = ['Identificação do Emitente', 'Animal', 'Responsável'];

      for (let i = 0; i < 3; i += 1) {
        const x = PAGE_MARGIN + i * (boxWidth + boxGap);

        doc
          .roundedRect(x, y, boxWidth, boxHeight, 6)
          .strokeColor('#000000')
          .lineWidth(0.8)
          .stroke();

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#000000')
          .text(boxTitles[i]!, x + 6, y + 8, {
            width: boxWidth - 12,
            align: 'center',
          });

        doc.font('Helvetica').fontSize(8);

        if (i === 0) {
          doc.text(`Nome: ${data.veterinarian.name}`, x + 8, y + 28, { width: boxWidth - 16 });
          doc.text(
            `CRMV: ${data.veterinarian.crmv ?? 'Não informado'}`,
            x + 8,
            y + 44,
            { width: boxWidth - 16 },
          );
        } else if (i === 1) {
          doc.text(`ID: ${shortPetId(data.pet.id)}`, x + 8, y + 28, { width: boxWidth - 16 });
          doc.text(`Nome: ${data.pet.name}`, x + 8, y + 40, { width: boxWidth - 16 });
          doc.text(
            `Espécie: ${PET_SPECIES_LABELS[data.pet.species] ?? data.pet.species}`,
            x + 8,
            y + 52,
            { width: boxWidth - 16 },
          );
          doc.text(`Raça: ${data.pet.breed ?? 'Não informada'}`, x + 8, y + 64, {
            width: boxWidth - 16,
          });
        } else {
          doc.text(`Nome: ${data.tutor.name}`, x + 8, y + 28, { width: boxWidth - 16 });
          doc.text(`Endereço: ${formatAddress(data.tutor)}`, x + 8, y + 44, {
            width: boxWidth - 16,
          });
        }
      }

      y += boxHeight + 24;

      for (const prescription of data.prescriptions) {
        if (y > doc.page.height - 120) {
          doc.addPage();
          y = PAGE_MARGIN;
        }

        const route = prescription.routeOfAdministration ?? 'USO ORAL';
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(route, PAGE_MARGIN, y);

        const routeWidth = doc.widthOfString(route);
        doc
          .moveTo(PAGE_MARGIN + routeWidth + 8, y + 8)
          .lineTo(PAGE_MARGIN + contentWidth, y + 8)
          .strokeColor('#cccccc')
          .lineWidth(0.5)
          .stroke();

        y += 20;

        const pharmacyLabel = prescription.pharmacyType
          ? PHARMACY_TYPE_LABELS[prescription.pharmacyType]
          : 'Farmácia Veterinária';

        doc.font('Helvetica').fontSize(9).fillColor('#000000').text(pharmacyLabel, PAGE_MARGIN, y);

        if (prescription.quantity) {
          const quantityText = prescription.quantity.toUpperCase();
          const quantityWidth = doc.widthOfString(quantityText) + 12;
          const quantityX = PAGE_MARGIN + contentWidth - quantityWidth;

          doc
            .rect(quantityX, y - 2, quantityWidth, 14)
            .strokeColor('#000000')
            .lineWidth(0.6)
            .stroke();

          doc.text(quantityText, quantityX + 6, y, { width: quantityWidth - 12, align: 'center' });
        }

        y += 18;

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .text(prescription.medicineName, PAGE_MARGIN, y, { width: contentWidth });

        y += 16;

        const instructions = formatInstructions(prescription);
        if (instructions) {
          doc.font('Helvetica').fontSize(10).text(instructions, PAGE_MARGIN, y, {
            width: contentWidth,
          });
          y += doc.heightOfString(instructions, { width: contentWidth }) + 8;
        }

        y += 16;
      }

      const consultationDate = data.finishedAt ?? data.startedAt;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#666666')
        .text(
          `Data: ${formatDate(consultationDate)}`,
          PAGE_MARGIN,
          doc.page.height - PAGE_MARGIN - 20,
          { width: contentWidth, align: 'right' },
        );

      doc.end();
    });
  }
}

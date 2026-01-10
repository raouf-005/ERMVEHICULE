import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  Invoice,
  Customer,
  InvoiceItem,
  Vehicle,
  Quote,
  RepairOrder,
  CompanySettings,
} from "@prisma/client";

/* ===================== TYPES ===================== */

type InvoiceWithRelations = Invoice & {
  customer: Customer;
  items: InvoiceItem[];
  vehicle?: Vehicle | null;
  quote?: Quote | null;
  repairOrder?: RepairOrder | null;
};

/* ===================== COULEURS ===================== */

const COLORS = {
  textMain: "#111827",
  textMuted: "#6B7280",
  accent: "#0f172a",
  border: "#E5E7EB",
  tableHeaderBg: "#F9FAFB",
  rowAlt: "#FAFAFA",
};

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  page: {
    padding: 32,
    paddingBottom: 92,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.textMain,
    lineHeight: 1.35,
  },

  /* ---------- HEADER ---------- */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },

  logoBlock: {
    width: "50%",
  },

  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 6,
  },

  companyAddress: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },

  invoiceMetaBlock: {
    width: "40%",
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: "#FAFAFA",
    alignItems: "flex-end",
  },

  invoiceTitle: {
    fontSize: 8.5,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.textMuted,
    marginBottom: 4,
  },

  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 6,
  },

  dateRow: {
    flexDirection: "row",
    marginTop: 2,
  },

  dateLabel: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    marginRight: 6,
  },

  dateValue: {
    fontSize: 8.5,
    fontWeight: "bold",
  },

  /* ---------- INFO GRID ---------- */

  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  column: {
    width: "50%",
  },

  infoCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },

  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginBottom: 6,
  },

  clientName: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 4,
  },

  addressText: {
    fontSize: 9,
    marginBottom: 1,
  },

  vehicleText: {
    fontSize: 9,
    marginBottom: 2,
  },

  vehicleHighlight: {
    fontWeight: "bold",
    color: COLORS.accent,
  },

  /* ---------- TABLE ---------- */

  tableContainer: {
    marginTop: 6,
    marginBottom: 14,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.tableHeaderBg,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  th: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.accent,
    textTransform: "uppercase",
  },

  td: {
    fontSize: 9,
  },

  colDesc: { width: "50%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colVat: { width: "10%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },

  /* ---------- TOTALS ---------- */

  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  totalsContainer: {
    width: "45%",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 6,
    backgroundColor: "#FAFAFA",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  totalLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },

  totalValue: {
    fontSize: 9,
    fontWeight: "bold",
  },

  finalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.accent,
    paddingTop: 8,
    marginTop: 6,
  },

  finalTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.accent,
    textTransform: "uppercase",
  },

  finalTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.accent,
  },

  /* ---------- NOTES ---------- */

  notesContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },

  notesText: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },

  /* ---------- FOOTER ---------- */

  footerContainer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  pageNumber: {
    fontSize: 8,
    color: COLORS.textMuted,
    textAlign: "right",
  },

  bankTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 4,
  },

  bankText: {
    fontSize: 9,
    color: COLORS.textMuted,
  },

  legalText: {
    textAlign: "center",
    fontSize: 7.5,
    color: "#9CA3AF",
    marginTop: 6,
  },
});

/* ===================== HELPERS ===================== */

const formatDate = (date?: Date | null) =>
  date
    ? new Date(date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const formatCurrency = (
  amount: number | { toNumber: () => number } | unknown
) =>
  Number(amount).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

const truncate = (value: unknown, maxChars: number) => {
  const text = typeof value === "string" ? value : String(value ?? "");
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const joinNonEmpty = (parts: Array<string | null | undefined>) =>
  parts.filter((p): p is string => isNonEmptyString(p)).join(" ");

const joinNonEmptyWith = (
  sep: string,
  parts: Array<string | null | undefined>
) => parts.filter((p): p is string => isNonEmptyString(p)).join(sep);

/* ===================== DEFAULT COMPANY ===================== */

const defaultCompany = {
  name: "Gad Garage",
  addressLine1: "123 Avenue de la Mécanique",
  addressLine2: null as string | null,
  postalCode: "75011",
  city: "Paris",
  country: "FR",
  email: "atelier@gadgarage.fr",
  phone: "01 45 67 89 10",
  website: null as string | null,
  siret: "800 123 456 00012",
  vatNumber: "FR 45 800123456",
  legalStatus: "SAS",
  capital: "10 000 €",
  logoUrl: null as string | null,
  invoiceFooter: null as string | null,
  iban: "",
  bic: "",
};

/* ===================== COMPONENT ===================== */

interface InvoicePDFProps {
  invoice: InvoiceWithRelations;
  companySettings?: CompanySettings | null;
}

export const InvoicePDF = ({ invoice, companySettings }: InvoicePDFProps) => {
  const company = { ...defaultCompany, ...companySettings };

  const companyLine2 = joinNonEmpty([
    isNonEmptyString(company.postalCode) ? company.postalCode : null,
    isNonEmptyString(company.city) ? company.city : null,
    isNonEmptyString(company.country) ? company.country : null,
  ]);

  const customerName =
    invoice.customer.companyName ||
    joinNonEmpty([
      invoice.customer.firstName ?? null,
      invoice.customer.lastName ?? null,
    ]);

  const customerLine2 = joinNonEmpty([
    isNonEmptyString(invoice.customer.postalCode)
      ? invoice.customer.postalCode
      : null,
    isNonEmptyString(invoice.customer.city) ? invoice.customer.city : null,
    isNonEmptyString(invoice.customer.country)
      ? invoice.customer.country
      : null,
  ]);

  const paymentNotes =
    (isNonEmptyString(company.invoiceFooter) && company.invoiceFooter.trim()) ||
    "Conditions de paiement : Paiement à réception. Aucun escompte pour paiement anticipé.";

  // Contrainte 1 page: on limite la longueur des notes et le nombre de lignes affichées.
  const notesText = truncate(paymentNotes, 260);

  const MAX_ITEMS = 10;
  const visibleItems = invoice.items.slice(0, MAX_ITEMS);
  const hiddenItemsCount = Math.max(0, invoice.items.length - MAX_ITEMS);

  const legalLine = joinNonEmptyWith(" — ", [
    company.name,
    company.legalStatus,
    isNonEmptyString(company.capital) ? `Capital ${company.capital}` : null,
    isNonEmptyString(company.siret) ? `SIRET ${company.siret}` : null,
    isNonEmptyString(company.vatNumber) ? `TVA ${company.vatNumber}` : null,
  ]);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoBlock}>
            {isNonEmptyString(company.logoUrl) ? (
              <>
                <Image
                  src={company.logoUrl}
                  style={{ width: 120, height: 50 }}
                />
                <Text style={[styles.companyAddress, { marginTop: 6 }]}>
                  {company.name}
                </Text>
              </>
            ) : (
              <Text style={styles.companyName}>{company.name}</Text>
            )}

            {isNonEmptyString(company.addressLine1) && (
              <Text style={styles.companyAddress}>{company.addressLine1}</Text>
            )}
            {isNonEmptyString(company.addressLine2) && (
              <Text style={styles.companyAddress}>{company.addressLine2}</Text>
            )}
            {isNonEmptyString(companyLine2) && (
              <Text style={styles.companyAddress}>{companyLine2}</Text>
            )}

            {isNonEmptyString(company.email) ||
            isNonEmptyString(company.phone) ? (
              <Text style={styles.companyAddress}>
                {joinNonEmptyWith(" • ", [
                  company.email ?? null,
                  company.phone ?? null,
                ])}
              </Text>
            ) : null}
            {isNonEmptyString(company.website) && (
              <Text style={styles.companyAddress}>{company.website}</Text>
            )}
          </View>

          <View style={styles.invoiceMetaBlock}>
            <Text style={styles.invoiceTitle}>Facture</Text>
            <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Date :</Text>
              <Text style={styles.dateValue}>
                {formatDate(invoice.issuedAt)}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Échéance :</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.dueAt)}</Text>
            </View>
          </View>
        </View>

        {/* CLIENT / VEHICLE */}
        <View style={styles.grid}>
          <View style={[styles.column, styles.infoCard]}>
            <Text style={styles.sectionLabel}>Destinataire</Text>
            <Text style={styles.clientName}>{customerName || "Client"}</Text>
            {isNonEmptyString(invoice.customer.addressLine1) && (
              <Text style={styles.addressText}>
                {invoice.customer.addressLine1}
              </Text>
            )}
            {isNonEmptyString(invoice.customer.addressLine2) && (
              <Text style={styles.addressText}>
                {invoice.customer.addressLine2}
              </Text>
            )}
            {isNonEmptyString(customerLine2) && (
              <Text style={styles.addressText}>{customerLine2}</Text>
            )}
          </View>

          <View style={[styles.column, styles.infoCard]}>
            <Text style={styles.sectionLabel}>Véhicule</Text>
            {invoice.vehicle ? (
              <>
                <Text style={styles.vehicleText}>
                  Modèle :{" "}
                  <Text style={styles.vehicleHighlight}>
                    {invoice.vehicle.make} {invoice.vehicle.model}
                  </Text>
                </Text>
                <Text style={styles.vehicleText}>
                  Immatriculation :{" "}
                  <Text style={styles.vehicleHighlight}>
                    {invoice.vehicle.registrationPlate}
                  </Text>
                </Text>
              </>
            ) : (
              <Text style={styles.addressText}>Non spécifié</Text>
            )}
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qté</Text>
            <Text style={[styles.th, styles.colPrice]}>PU HT</Text>
            <Text style={[styles.th, styles.colVat]}>TVA</Text>
            <Text style={[styles.th, styles.colTotal]}>Total HT</Text>
          </View>

          {invoice.items.map((item, i) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                i % 2 === 0 ? { backgroundColor: COLORS.rowAlt } : {},
              ]}
            >
              <Text style={[styles.td, styles.colDesc]}>
                {truncate(item.description, 90)}
              </Text>
              <Text style={[styles.td, styles.colQty]}>
                {Number(item.quantity)}
              </Text>
              <Text style={[styles.td, styles.colPrice]}>
                {formatCurrency(item.unitPriceHt)}
              </Text>
              <Text style={[styles.td, styles.colVat]}>
                {Number(item.vatRate).toFixed(0)}%
              </Text>
              <Text style={[styles.td, styles.colTotal]}>
                {formatCurrency(item.lineTotalHt)}
              </Text>
            </View>
          ))}

          {hiddenItemsCount > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.td, styles.colDesc]}>
                {`+ ${hiddenItemsCount} ligne(s) supplémentaire(s) non affichée(s)`}
              </Text>
              <Text style={[styles.td, styles.colQty]}>{""}</Text>
              <Text style={[styles.td, styles.colPrice]}>{""}</Text>
              <Text style={[styles.td, styles.colVat]}>{""}</Text>
              <Text style={[styles.td, styles.colTotal]}>{""}</Text>
            </View>
          )}
        </View>

        {/* TOTALS */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.subtotalHt)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.vatTotal)}
              </Text>
            </View>
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Net à payer</Text>
              <Text style={styles.finalTotalValue}>
                {formatCurrency(invoice.totalTtc)}
              </Text>
            </View>
          </View>
        </View>

        {/* NOTES / CONDITIONS */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionLabel}>Conditions / Notes</Text>
          <Text style={styles.notesText}>
            {notesText}
            {hiddenItemsCount > 0
              ? `\nDétail complet : ${hiddenItemsCount} ligne(s) supplémentaire(s) disponible(s) dans l'application.`
              : ""}
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footerContainer} fixed>
          <View style={styles.footerRow}>
            <View style={{ flex: 1 }}>
              {isNonEmptyString(company.iban) &&
              isNonEmptyString(company.bic) ? (
                <>
                  <Text style={styles.bankTitle}>Coordonnées bancaires</Text>
                  <Text style={styles.bankText}>IBAN : {company.iban}</Text>
                  <Text style={styles.bankText}>BIC : {company.bic}</Text>
                </>
              ) : null}
              {isNonEmptyString(legalLine) && (
                <Text style={styles.legalText}>{legalLine}</Text>
              )}
              <Text style={styles.legalText}>
                Document généré automatiquement – valable sans signature
              </Text>
            </View>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} / ${totalPages}`
              }
              fixed
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

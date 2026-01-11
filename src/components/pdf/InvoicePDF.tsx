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

export type InvoiceWithRelations = Invoice & {
  customer: Customer;
  items: InvoiceItem[];
  vehicle?: Vehicle | null;
  quote?: Quote | null;
  repairOrder?: RepairOrder | null;
};

/* ===================== COULEURS - THEME MINIMALISTE ===================== */

const COLORS = {
  primary: "#1F2937",
  secondary: "#1F2937",
  accent: "#374151",
  dark: "#111827",
  text: "#374151",
  textLight: "#6B7280",
  textMuted: "#9CA3AF",
  background: "#F9FAFB",
  white: "#FFFFFF",
  border: "#E5E7EB",
  success: "#374151",
  warning: "#6B7280",
};

/* ===================== STYLES - DESIGN MODERNE ===================== */

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },

  heroHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 24,
    paddingHorizontal: 40,
    marginBottom: 0,
  },

  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  companySection: {
    flex: 1,
  },

  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  companyDetails: {
    fontSize: 8,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.5,
  },

  invoiceBadge: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 160,
    alignItems: "center",
  },

  invoiceLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },

  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },

  invoiceDate: {
    fontSize: 9,
    color: COLORS.text,
  },

  statusRibbon: {
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
  },

  statusValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.dark,
  },

  contentArea: {
    paddingHorizontal: 40,
    paddingTop: 20,
  },

  infoGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },

  infoCard: {
    flex: 1,
    padding: 14,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.border,
  },

  infoCardAlt: {
    borderLeftColor: COLORS.border,
  },

  cardTitle: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    marginBottom: 8,
  },

  cardMainText: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 4,
  },

  cardSubText: {
    fontSize: 8.5,
    color: COLORS.text,
    lineHeight: 1.4,
  },

  vehicleInfo: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  vehicleBadge: {
    backgroundColor: COLORS.white,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  vehicleBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  tableSection: {
    marginBottom: 16,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  th: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  tableBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.border,
    borderRadius: 6,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: "hidden",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tableRowAlt: {
    backgroundColor: COLORS.background,
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  td: {
    fontSize: 8.5,
    color: COLORS.text,
  },

  tdBold: {
    fontWeight: "bold",
    color: COLORS.dark,
  },

  colDesc: { width: "46%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "16%", textAlign: "right" },
  colVat: { width: "12%", textAlign: "right" },
  colTotal: { width: "16%", textAlign: "right" },

  overflowRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    justifyContent: "center",
  },

  overflowText: {
    fontSize: 8,
    color: COLORS.textLight,
    fontWeight: "bold",
  },

  totalsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },

  totalsCard: {
    width: "42%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
  },

  totalRowAlt: {
    backgroundColor: COLORS.background,
  },

  totalLabel: {
    fontSize: 9,
    color: COLORS.textLight,
  },

  totalValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.text,
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary,
  },

  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.white,
  },

  paymentSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },

  paymentCard: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },

  paymentTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  paymentText: {
    fontSize: 8,
    color: COLORS.text,
    lineHeight: 1.5,
  },

  paymentHighlight: {
    fontWeight: "bold",
    color: COLORS.dark,
  },

  notesSection: {
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.border,
    marginBottom: 14,
  },

  notesTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  notesText: {
    fontSize: 8,
    color: COLORS.text,
    lineHeight: 1.5,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: COLORS.dark,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerLeft: {
    flex: 1,
  },

  footerText: {
    fontSize: 7,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.4,
  },

  footerRight: {
    alignItems: "flex-end",
  },

  pageNumber: {
    fontSize: 8,
    color: COLORS.white,
    fontWeight: "bold",
  },

  footerBrand: {
    fontSize: 7,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
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

  const companyFullAddress = joinNonEmptyWith(", ", [
    company.addressLine1,
    company.addressLine2,
    joinNonEmpty([company.postalCode, company.city]),
  ]);

  const customerName =
    invoice.customer.companyName ||
    joinNonEmpty([
      invoice.customer.firstName ?? null,
      invoice.customer.lastName ?? null,
    ]);

  const customerAddress = joinNonEmptyWith(", ", [
    invoice.customer.addressLine1,
    invoice.customer.addressLine2,
    joinNonEmpty([invoice.customer.postalCode, invoice.customer.city]),
  ]);

  const MAX_ITEMS = 8;
  const visibleItems = invoice.items.slice(0, MAX_ITEMS);
  const hiddenItemsCount = Math.max(0, invoice.items.length - MAX_ITEMS);

  const legalLine = joinNonEmptyWith(" • ", [
    company.name,
    company.legalStatus,
    isNonEmptyString(company.siret) ? `SIRET: ${company.siret}` : null,
    isNonEmptyString(company.vatNumber) ? `TVA: ${company.vatNumber}` : null,
  ]);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        {/* HERO HEADER */}
        <View style={styles.heroHeader}>
          <View style={styles.heroContent}>
            <View style={styles.companySection}>
              {isNonEmptyString(company.logoUrl) ? (
                <Image
                  src={company.logoUrl}
                  style={{ width: 140, height: 45, marginBottom: 8 }}
                />
              ) : (
                <Text style={styles.companyName}>{company.name}</Text>
              )}
              <Text style={styles.companyDetails}>
                {companyFullAddress}
                {"\n"}
                {joinNonEmptyWith(" • ", [company.phone, company.email])}
              </Text>
            </View>

            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceLabel}>Facture</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                {formatDate(invoice.issuedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* STATUS RIBBON */}
        <View style={styles.statusRibbon}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Date d&apos;émission:</Text>
            <Text style={styles.statusValue}>
              {formatDate(invoice.issuedAt)}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Échéance:</Text>
            <Text style={styles.statusValue}>{formatDate(invoice.dueAt)}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Statut:</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color:
                    invoice.status === "PAID" ? COLORS.success : COLORS.warning,
                },
              ]}
            >
              {invoice.status === "PAID"
                ? "Payée"
                : invoice.status === "ISSUED"
                ? "Émise"
                : invoice.status === "DRAFT"
                ? "Brouillon"
                : invoice.status === "CANCELED"
                ? "Annulée"
                : invoice.status}
            </Text>
          </View>
        </View>

        {/* CONTENT AREA */}
        <View style={styles.contentArea}>
          {/* INFO CARDS */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Facturé à</Text>
              <Text style={styles.cardMainText}>
                {customerName || "Client"}
              </Text>
              <Text style={styles.cardSubText}>
                {customerAddress || "Adresse non renseignée"}
              </Text>
              {isNonEmptyString(invoice.customer.email) && (
                <Text style={[styles.cardSubText, { marginTop: 4 }]}>
                  {invoice.customer.email}
                </Text>
              )}
            </View>

            <View style={[styles.infoCard, styles.infoCardAlt]}>
              <Text style={styles.cardTitle}>Véhicule concerné</Text>
              {invoice.vehicle ? (
                <>
                  <Text style={styles.cardMainText}>
                    {invoice.vehicle.make} {invoice.vehicle.model}
                  </Text>
                  <View style={styles.vehicleInfo}>
                    <View style={styles.vehicleBadge}>
                      <Text style={styles.vehicleBadgeText}>
                        {invoice.vehicle.registrationPlate}
                      </Text>
                    </View>
                    {invoice.vehicle.year && (
                      <View style={styles.vehicleBadge}>
                        <Text style={styles.vehicleBadgeText}>
                          {invoice.vehicle.year}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.cardSubText}>Aucun véhicule associé</Text>
              )}
            </View>
          </View>

          {/* TABLE */}
          <View style={styles.tableSection}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colDesc]}>Description</Text>
              <Text style={[styles.th, styles.colQty]}>Qté</Text>
              <Text style={[styles.th, styles.colPrice]}>Prix Unit.</Text>
              <Text style={[styles.th, styles.colVat]}>TVA</Text>
              <Text style={[styles.th, styles.colTotal]}>Total HT</Text>
            </View>

            <View style={styles.tableBody}>
              {visibleItems.map((item, i) => (
                <View
                  key={item.id}
                  style={[
                    styles.tableRow,
                    i % 2 === 1 ? styles.tableRowAlt : {},
                    i === visibleItems.length - 1 && hiddenItemsCount === 0
                      ? styles.tableRowLast
                      : {},
                  ]}
                >
                  <Text style={[styles.td, styles.colDesc]}>
                    {truncate(item.description, 70)}
                  </Text>
                  <Text style={[styles.td, styles.tdBold, styles.colQty]}>
                    {Number(item.quantity)}
                  </Text>
                  <Text style={[styles.td, styles.colPrice]}>
                    {formatCurrency(item.unitPriceHt)}
                  </Text>
                  <Text style={[styles.td, styles.colVat]}>
                    {Number(item.vatRate).toFixed(0)}%
                  </Text>
                  <Text style={[styles.td, styles.tdBold, styles.colTotal]}>
                    {formatCurrency(item.lineTotalHt)}
                  </Text>
                </View>
              ))}

              {hiddenItemsCount > 0 && (
                <View style={styles.overflowRow}>
                  <Text style={styles.overflowText}>
                    + {hiddenItemsCount} article(s) supplémentaire(s) - voir
                    détail complet
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* TOTALS */}
          <View style={styles.totalsWrapper}>
            <View style={styles.totalsCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total HT</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.subtotalHt)}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowAlt]}>
                <Text style={styles.totalLabel}>TVA</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.vatTotal)}
                </Text>
              </View>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total TTC</Text>
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(invoice.totalTtc)}
                </Text>
              </View>
            </View>
          </View>

          {/* PAYMENT INFO */}
          <View style={styles.paymentSection}>
            {(isNonEmptyString(company.iban) ||
              isNonEmptyString(company.bic)) && (
              <View style={styles.paymentCard}>
                <Text style={styles.paymentTitle}>Coordonnées bancaires</Text>
                {isNonEmptyString(company.iban) && (
                  <Text style={styles.paymentText}>
                    <Text style={styles.paymentHighlight}>IBAN:</Text>{" "}
                    {company.iban}
                  </Text>
                )}
                {isNonEmptyString(company.bic) && (
                  <Text style={styles.paymentText}>
                    <Text style={styles.paymentHighlight}>BIC:</Text>{" "}
                    {company.bic}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Échéance de paiement</Text>
              <Text style={styles.paymentText}>
                Date limite:{" "}
                <Text style={styles.paymentHighlight}>
                  {formatDate(invoice.dueAt)}
                </Text>
              </Text>
              <Text style={styles.paymentText}>
                Montant dû:{" "}
                <Text style={styles.paymentHighlight}>
                  {formatCurrency(invoice.totalTtc)}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>{legalLine}</Text>
          </View>
          <View style={styles.footerRight}>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber}/${totalPages}`
              }
            />
            <Text style={styles.footerBrand}>Généré automatiquement</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

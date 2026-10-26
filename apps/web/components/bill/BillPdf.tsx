import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  company: { fontSize: 20, fontWeight: "bold", color: "#0a0c10", marginBottom: 2 },
  muted: { fontSize: 9, color: "#6b7280", marginTop: 1 },
  invoiceTitle: { fontSize: 26, fontWeight: "bold", color: "#0a0c10", letterSpacing: 1 },
  meta: { fontSize: 9, color: "#374151", marginTop: 2, textAlign: "right" },
  accentLine: { height: 2, backgroundColor: "#f59e0b", marginBottom: 18 },
  billTo: { marginBottom: 18 },
  label: { fontSize: 8, fontWeight: "bold", color: "#9ca3af", letterSpacing: 1.2, marginBottom: 4 },
  partyName: { fontSize: 13, fontWeight: "bold", color: "#0a0c10", marginBottom: 2 },
  table: { marginBottom: 16 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 7, paddingHorizontal: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  th: { fontSize: 8.5, fontWeight: "bold", color: "#111827", textTransform: "uppercase", letterSpacing: 0.6 },
  row: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  rowAlt: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, backgroundColor: "#fafafa", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  td: { fontSize: 9.5, color: "#1f2937" },
  totalRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 6, backgroundColor: "#f9fafb", borderTopWidth: 1, borderTopColor: "#e5e7eb", borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  totalLabel: { fontSize: 11, fontWeight: "bold", color: "#0a0c10" },
  totalValue: { fontSize: 11, fontWeight: "bold", color: "#0a0c10" },
  footer: { marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  signatureRow: { marginTop: 30, flexDirection: "row", justifyContent: "flex-end" },
  sigLine: { width: 140, borderBottomWidth: 1, borderBottomColor: "#9ca3af", marginBottom: 4, marginRight: 8 },
  draftBadge: { fontSize: 9, fontWeight: "bold", color: "#b45309", marginTop: 4, textAlign: "right" },
});

export default function BillPdf({ bill, company }: { bill: any; company: any }) {
  const data = bill?.data || {};
  const items: any[] = Array.isArray(data.items) ? data.items : [];
  const total = data.total ?? items.reduce((s: number, i: any) => s + (i.rate || 0) * (i.qty || 0), 0);
  const party = data.party;
  const date = bill?.createdAt
    ? new Date(bill.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Draft";
  const invNo = bill?.invoiceNumber || "DRAFT";
  const isDraft = !bill?.invoiceNumber;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.company}>{company?.companyName || company?.name || "Glow & Flow"}</Text>
            {company?.address ? <Text style={styles.muted}>{company.address}</Text> : null}
            {Array.isArray(company?.phone) && company.phone.length > 0 ? (
              <Text style={styles.muted}>{company.phone.join("   •   ")}</Text>
            ) : null}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.meta}>{invNo}</Text>
            <Text style={styles.meta}>Date: {date}</Text>
            {isDraft ? <Text style={styles.draftBadge}>DRAFT</Text> : null}
          </View>
        </View>

        <View style={styles.accentLine} />

        <View style={styles.billTo}>
          <Text style={styles.label}>BILL TO</Text>
          <Text style={styles.partyName}>{party?.name || "—"}</Text>
          {party?.phone ? <Text style={styles.muted}>{party.phone}</Text> : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: "6%" }]}>#</Text>
            <Text style={[styles.th, { width: "38%" }]}>Service</Text>
            <Text style={[styles.th, { width: "12%", textAlign: "center" }]}>Unit</Text>
            <Text style={[styles.th, { width: "10%", textAlign: "center" }]}>Qty</Text>
            <Text style={[styles.th, { width: "16%", textAlign: "right" }]}>Rate</Text>
            <Text style={[styles.th, { width: "18%", textAlign: "right" }]}>Amount</Text>
          </View>
          {items.map((it: any, idx: number) => (
            <View key={idx} style={idx % 2 === 0 ? styles.row : styles.rowAlt}>
              <Text style={[styles.td, { width: "6%" }]}>{idx + 1}</Text>
              <Text style={[styles.td, { width: "38%" }]}>{it.name || "—"}</Text>
              <Text style={[styles.td, { width: "12%", textAlign: "center", textTransform: "capitalize" }]}>{it.unit || "piece"}</Text>
              <Text style={[styles.td, { width: "10%", textAlign: "center" }]}>{it.qty}</Text>
              <Text style={[styles.td, { width: "16%", textAlign: "right" }]}>{it.rate}</Text>
              <Text style={[styles.td, { width: "18%", textAlign: "right" }]}>{(it.rate || 0) * (it.qty || 0)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: "76%" }]}>Total</Text>
            <Text style={[styles.totalValue, { width: "24%", textAlign: "right" }]}>{total}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.muted}>Thank you for your business.</Text>
          <View style={styles.signatureRow}>
            <View style={styles.sigLine} />
            <Text style={styles.muted}>Authorised signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

import React from "react";
import { NextResponse } from "next/server";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const pdfStyles = StyleSheet.create({
  page: { padding: 24, fontSize: 12, fontFamily: "Helvetica" },
  header: { marginBottom: 12 },
  title: { fontSize: 20, marginBottom: 6 },
  section: { marginBottom: 8 },
  mono: { fontFamily: "Courier", fontSize: 10 },
});

export async function GET(request: Request, { params }: { params: { reportId: string } }) {
  const { reportId } = params;
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { patient: true, generatedBy: { include: { professional: true } } },
  });

  if (!report) return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });

  const snapshot = report.snapshot ?? {};
  const professional = report.generatedBy?.professional;
  const clinicName = professional?.clinicName ?? report.generatedBy?.name ?? "";
  const logoUrl = professional?.logoUrl ?? null;

  function renderSnapshotElements(obj: any) {
    if (!obj || typeof obj !== "object") return [<Text key="primitive">{String(obj)}</Text>];

    const elements: React.ReactNode[] = [];
    for (const [k, value] of Object.entries(obj)) {
      const key = k as string;
      if (Array.isArray(value)) {
        elements.push(
          <View key={key} style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: 600 }}>{key}</Text>
            {value.map((v: any, i: number) => (
              <Text key={i} style={{ fontSize: 11, marginLeft: 6 }}>
                - {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </Text>
            ))}
          </View>
        );
      } else if (typeof value === "object") {
        elements.push(
          <View key={key} style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: 600 }}>{key}</Text>
            <Text style={{ fontSize: 11, marginLeft: 6 }}>{JSON.stringify(value, null, 2)}</Text>
          </View>
        );
      } else {
        elements.push(
          <Text key={key} style={{ fontSize: 11 }}>
            <Text style={{ fontWeight: 600 }}>{key}: </Text>
            {String(value)}
          </Text>
        );
      }
    }
    return elements;
  }

  const Doc = (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={{ ...pdfStyles.header, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {logoUrl && <Image src={logoUrl} style={{ width: 64, height: 64, marginRight: 10 }} />}
              <View>
                <Text style={{ fontSize: 14, fontWeight: 700 }}>{clinicName}</Text>
                <Text style={{ fontSize: 10, color: "#666" }}>{report.generatedBy?.email ?? ""}</Text>
              </View>
            </View>

            <View style={{ textAlign: "right" }}>
              <Text style={{ fontSize: 18, fontWeight: 700 }}>{report.patient.name}</Text>
              <Text style={{ fontSize: 11 }}>{`Período: ${report.periodStart.toISOString().slice(0, 10)} → ${report.periodEnd
                .toISOString()
                .slice(0, 10)}`}</Text>
              <Text style={{ fontSize: 10, color: "#666" }}>{`Gerado por: ${report.generatedBy?.name ?? "-"} em ${report.createdAt
                .toISOString()
                .slice(0, 10)}`}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 12, marginBottom: 8 }}>
          <Text style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Informações do paciente</Text>
          <Text style={{ fontSize: 11 }}>{`Nome: ${report.patient.name}`}</Text>
          {report.patient.birthDate && (
            <Text style={{ fontSize: 11 }}>{`Nascimento: ${report.patient.birthDate.toISOString().slice(0, 10)}`}</Text>
          )}
          {report.patient.email && <Text style={{ fontSize: 11 }}>{`E-mail: ${report.patient.email}`}</Text>}
          {report.patient.phone && <Text style={{ fontSize: 11 }}>{`Telefone: ${report.patient.phone}`}</Text>}
        </View>

        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Conteúdo do relatório</Text>
          {renderSnapshotElements(snapshot)}
        </View>

        <View style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
          <View style={{ borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 }}>
            <Text style={{ fontSize: 10, color: "#666" }}>{clinicName} • Relatório gerado em {report.createdAt.toISOString().slice(0, 10)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  const buffer = (await pdf(Doc).toBuffer()) as any;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buffer.length),
      "Content-Disposition": `inline; filename="report-${reportId}.pdf"`,
    },
  });
}

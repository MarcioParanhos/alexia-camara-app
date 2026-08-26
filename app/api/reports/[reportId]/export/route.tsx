import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import type { ReportSnapshot } from "@/components/relatorio-documento";

export const runtime = "nodejs";

// Mesma paleta usada na prévia em tela (lib/design-tokens.ts)
const C = {
  bg: "#FAF8F3",
  surface: "#F1ECE1",
  card: "#FFFFFF",
  ink: "#22291F",
  inkSoft: "#5B6157",
  inkFaint: "#8A8F7F",
  primary: "#3F6B58",
  primaryDark: "#2C4B3E",
  accent: "#B9812F",
  accentSoft: "#F1E2C2",
  attention: "#A94A3D",
  line: "#DDD5C4",
};

const pdfStyles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", backgroundColor: C.card, color: C.ink },

  // Capa
  cover: { borderRadius: 8, padding: 28, marginBottom: 20, backgroundColor: C.primaryDark },
  coverKicker: { fontSize: 9, color: "#FFFFFFB3", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 },
  coverTitle: { fontSize: 24, color: "#FFFFFF", marginBottom: 14, lineHeight: 1.25 },
  coverRow: { flexDirection: "row", gap: 28, marginBottom: 14 },
  coverLabel: { fontSize: 8, color: "#FFFFFF80", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  coverValue: { fontSize: 11, color: "#FFFFFF", fontWeight: 700 },
  coverDiagnosis: { fontSize: 9, color: "#FFFFFFB3", maxWidth: 340, lineHeight: 1.5 },

  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  brandLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 34, height: 34, marginRight: 8, borderRadius: 4 },
  brandName: { fontSize: 11, fontWeight: 700, color: C.primaryDark },
  pageTag: { fontSize: 8, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 1.5 },

  sectionLabel: { fontSize: 9, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },

  // Fases
  phaseBarTrack: { flexDirection: "row", height: 7, borderRadius: 4, overflow: "hidden", backgroundColor: C.surface, marginBottom: 10 },
  phaseLegendRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 22 },
  phaseLegendItem: { width: "33%", flexDirection: "row", alignItems: "flex-start", marginBottom: 8, paddingRight: 6 },
  phaseDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5, marginTop: 2 },
  phaseName: { fontSize: 9, color: C.ink, fontWeight: 700, marginBottom: 1 },
  phaseCount: { fontSize: 8, color: C.inkFaint },

  // Evoluções
  evoCard: { backgroundColor: C.surface, borderRadius: 6, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  evoHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  evoTitle: { fontSize: 10, fontWeight: 700, color: C.ink },
  evoDate: { fontSize: 8, color: C.inkFaint, marginTop: 1 },
  evoMetrics: { fontSize: 8, color: C.inkFaint, textAlign: "right" },
  evoNote: { fontSize: 9, color: C.inkSoft, marginTop: 6, lineHeight: 1.4 },

  // Métricas (dor / amplitude)
  metricsRow: { flexDirection: "row", gap: 12, marginBottom: 22 },
  metricCard: { flex: 1, backgroundColor: C.surface, borderRadius: 6, padding: 10, borderWidth: 1, borderColor: C.line },
  metricLabel: { fontSize: 8, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  metricEmpty: { fontSize: 8, color: C.inkFaint },
  metricSummary: { fontSize: 8, color: C.inkFaint, marginTop: 6 },

  // Parecer
  parecerBox: { backgroundColor: "#DCE5DA", borderRadius: 6, padding: 14, marginBottom: 22 },
  parecerText: { fontSize: 10.5, color: C.primaryDark, lineHeight: 1.5, fontStyle: "italic" },
  parecerAuthor: { fontSize: 8, color: C.primaryDark, marginTop: 8, opacity: 0.8 },

  // Marcos
  milestoneRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 22 },
  milestoneChip: { backgroundColor: C.accentSoft, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 9 },
  milestoneText: { fontSize: 8, color: C.accent },

  emptyText: { fontSize: 9, color: C.inkFaint, marginBottom: 16 },

  footer: { position: "absolute", bottom: 24, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
  footerName: { fontSize: 9, color: C.ink, fontWeight: 700 },
  footerRole: { fontSize: 8, color: C.inkFaint },
  footerRight: { fontSize: 8, color: C.inkFaint },
});

function formatarData(data: string | Date | null) {
  if (!data) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(data));
}

export async function GET(request: Request, { params }: { params: { reportId: string } }) {
  try {
    const { reportId } = params;
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { patient: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });
    }

    const s = report.snapshot as unknown as ReportSnapshot;
    const brandColor = s.professional?.brandColor || C.primary;
    const logoUrl = s.professional?.logoUrl ?? null;
    const clinicName = s.professional?.clinicName || s.professional?.name || "";
    const totalPrevisto = s.phases.reduce((sum, f) => sum + f.plannedSessions, 0);
    const romMax = s.romHistory.length ? Math.max(...s.romHistory.map((r) => r.romDegrees)) : 0;

    const Doc = (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          {/* Capa / resumo do período */}
          <View style={pdfStyles.cover}>
            <Text style={pdfStyles.coverKicker}>Relatório de evolução</Text>
            <View style={pdfStyles.coverRow}>
              <View>
                <Text style={pdfStyles.coverLabel}>Paciente</Text>
                <Text style={pdfStyles.coverValue}>{s.patientName}</Text>
              </View>
              <View>
                <Text style={pdfStyles.coverLabel}>Período</Text>
                <Text style={pdfStyles.coverValue}>{formatarData(s.periodStart)} — {formatarData(s.periodEnd)}</Text>
              </View>
              <View>
                <Text style={pdfStyles.coverLabel}>Sessões no período</Text>
                <Text style={pdfStyles.coverValue}>{s.totalSessoesNoPeriodo}</Text>
              </View>
            </View>
            <Text style={pdfStyles.coverDiagnosis}>{s.diagnosis || "Diagnóstico não informado"}</Text>
          </View>

          {/* Marca do profissional */}
          <View style={pdfStyles.brandRow}>
            <View style={pdfStyles.brandLeft}>
              {logoUrl && <Image src={logoUrl} style={pdfStyles.logo} />}
              <Text style={pdfStyles.brandName}>{clinicName}</Text>
            </View>
            <Text style={pdfStyles.pageTag}>Relatório clínico</Text>
          </View>

          {/* Fases */}
          {s.phases.length > 0 && (
            <View>
              <Text style={pdfStyles.sectionLabel}>Progresso por fase do tratamento</Text>
              <View style={pdfStyles.phaseBarTrack}>
                {s.phases.map((f, i) => (
                  <View key={i} style={{ width: `${totalPrevisto > 0 ? (f.plannedSessions / totalPrevisto) * 100 : 0}%`, backgroundColor: C.surface }}>
                    <View
                      style={{
                        height: "100%",
                        width: `${f.plannedSessions > 0 ? Math.min(100, (f.completedSessions / f.plannedSessions) * 100) : 0}%`,
                        backgroundColor: f.color,
                      }}
                    />
                  </View>
                ))}
              </View>
              <View style={pdfStyles.phaseLegendRow}>
                {s.phases.map((f, i) => (
                  <View key={i} style={pdfStyles.phaseLegendItem}>
                    <View style={[pdfStyles.phaseDot, { backgroundColor: f.color }]} />
                    <View>
                      <Text style={pdfStyles.phaseName}>{f.name}</Text>
                      <Text style={pdfStyles.phaseCount}>{f.completedSessions}/{f.plannedSessions} sessões</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Evoluções */}
          <Text style={pdfStyles.sectionLabel}>Evoluções do período</Text>
          {s.evolutions.length === 0 ? (
            <Text style={pdfStyles.emptyText}>Nenhuma evolução registrada no período.</Text>
          ) : (
            <View style={{ marginBottom: 16 }}>
              {s.evolutions.map((ev) => (
                <View key={ev.id} style={pdfStyles.evoCard} wrap={false}>
                  <View style={pdfStyles.evoHeaderRow}>
                    <View>
                      <Text style={pdfStyles.evoTitle}>{ev.title}</Text>
                      <Text style={pdfStyles.evoDate}>{formatarData(ev.sessionDate)}</Text>
                    </View>
                    <View style={pdfStyles.evoMetrics}>
                      {ev.painLevel !== null && <Text>Dor: {ev.painLevel}/10</Text>}
                      {ev.romDegrees !== null && <Text>Amplitude: {ev.romDegrees}°</Text>}
                    </View>
                  </View>
                  {ev.note && <Text style={pdfStyles.evoNote}>{ev.note}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Amplitude / Dor */}
          <View style={pdfStyles.metricsRow}>
            <View style={pdfStyles.metricCard}>
              <Text style={pdfStyles.metricLabel}>Amplitude de movimento</Text>
              {s.romHistory.length === 0 ? (
                <Text style={pdfStyles.metricEmpty}>Sem registros de amplitude no período.</Text>
              ) : (
                <>
                  {s.romHistory.map((r, i) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                      <Text style={{ fontSize: 8, color: C.inkFaint, width: 60 }}>{formatarData(r.date)}</Text>
                      <View style={{ flex: 1, height: 5, backgroundColor: C.line, borderRadius: 3, marginRight: 6 }}>
                        <View style={{ height: 5, borderRadius: 3, width: `${romMax ? (r.romDegrees / romMax) * 100 : 0}%`, backgroundColor: brandColor }} />
                      </View>
                      <Text style={{ fontSize: 8, color: C.ink }}>{r.romDegrees}°</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
            <View style={pdfStyles.metricCard}>
              <Text style={pdfStyles.metricLabel}>Nível de dor (EVA)</Text>
              {s.painHistory.length === 0 ? (
                <Text style={pdfStyles.metricEmpty}>Sem registros de dor no período.</Text>
              ) : (
                <>
                  {s.painHistory.map((p, i) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                      <Text style={{ fontSize: 8, color: C.inkFaint, width: 60 }}>{formatarData(p.date)}</Text>
                      <View style={{ flex: 1, height: 5, backgroundColor: C.line, borderRadius: 3, marginRight: 6 }}>
                        <View style={{ height: 5, borderRadius: 3, width: `${(p.painLevel / 10) * 100}%`, backgroundColor: C.attention }} />
                      </View>
                      <Text style={{ fontSize: 8, color: C.ink }}>{p.painLevel}/10</Text>
                    </View>
                  ))}
                  <Text style={pdfStyles.metricSummary}>
                    {s.painHistory[0].painLevel} → {s.painHistory[s.painHistory.length - 1].painLevel} no período
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Parecer */}
          {s.parecer && (
            <View style={pdfStyles.parecerBox}>
              <Text style={pdfStyles.parecerText}>{s.parecer}</Text>
              <Text style={pdfStyles.parecerAuthor}>— {s.professional?.name}, fisioterapeuta responsável</Text>
            </View>
          )}

          {/* Marcos */}
          {s.milestones.length > 0 && (
            <View>
              <Text style={pdfStyles.sectionLabel}>Marcos deste período</Text>
              <View style={pdfStyles.milestoneRow}>
                {s.milestones.map((m, i) => (
                  <View key={i} style={pdfStyles.milestoneChip}>
                    <Text style={pdfStyles.milestoneText}>{m.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rodapé */}
          <View style={pdfStyles.footer} fixed>
            <View>
              <Text style={pdfStyles.footerName}>{s.professional?.name}</Text>
              <Text style={pdfStyles.footerRole}>
                {s.professional?.crefito ? `CREFITO ${s.professional.crefito}` : ""}
                {s.professional?.specialty ? ` · ${s.professional.specialty}` : ""}
              </Text>
            </View>
            <Text style={pdfStyles.footerRight}>Emitido em {formatarData(report.createdAt)}</Text>
          </View>
        </Page>
      </Document>
    );

    const buffer = await renderToBuffer(Doc);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": buffer.byteLength.toString(),
        "Content-Disposition": `inline; filename="relatorio-${report.patient.name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("ERRO CRÍTICO NA GERAÇÃO DO PDF:", error);
    return NextResponse.json(
      { error: "Falha interna ao gerar e processar o arquivo PDF." },
      { status: 500 }
    );
  }
}
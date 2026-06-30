import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
} from "@react-email/components";
import * as React from "react";

interface ReportReadyEmailProps {
  userName?: string;
  fileName?: string;
  reportId?: string;
}

export const ReportReadyEmail = ({
  userName = "User",
  fileName = "fabric_sample.jpg",
  reportId = "",
}: ReportReadyEmailProps) => {
  const dashboardUrl = `http://localhost:3000/en/dashboard/reports/${reportId}`;

  return (
    <Html>
      <Head />
      <Preview>Your ThreadCounty AI Analysis is Complete</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Analysis Complete</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Your AI fabric analysis for <strong>{fileName}</strong> has successfully completed. 
            Our computer vision model has extracted the thread density, warp/weft counts, and material composition.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={dashboardUrl}>
              View Report
            </Button>
          </Section>
          <Text style={footer}>
            — The ThreadCounty AI Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReportReadyEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  fontWeight: "bold",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  marginTop: "40px",
};

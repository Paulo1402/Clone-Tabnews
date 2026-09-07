import { Banner } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";

export default function ConfirmRegisterPage() {
  return (
    <DefaultLayout
      contentWidth="small"
      metadata={{ title: "Confirme seu email" }}
    >
      <Banner
        variant="warning"
        title="Confirme seu email"
        description="Enviamos um email para confirmar sua conta."
      />
    </DefaultLayout>
  );
}

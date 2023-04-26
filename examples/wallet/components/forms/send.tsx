import { Button } from "@/ui/Button";
import { useLayoutTemplate } from "@/ui/Dialog";
import { Horizontal } from "@/ui/Horizontal";
import { Spinner } from "flowbite-react";
import { FormDataInput, FormProcessor } from "./index";
import { useForm } from "react-hook-form";
import { Vertical } from "@/ui/Vertical";
import { validEthAddress } from "@/config/constants";

export type SendData = { amount: string; currency: string; address: string };

const form: FormDataInput<SendData> = {
  title: "Send Token to an address",
  fields: [
    {
      type: "combination",
      label: "Token Amount",
      fields: [
        {
          label: "",
          name: "amount",
          type: "numericfield",
          required: "You must provide an amount",
        },
        {
          type: "dropdown",
          label: "",
          name: "currency",
          required: true,
          options: [
            { label: "ETH", value: "ETH" },
            { label: "USDC", value: "USDC" },
          ],
        },
      ],
    },
    {
      type: "textfield",
      name: "address",
      label: "Reciever's Address",
      pattern: {
        value: validEthAddress,
        message: "Please enter an ethereum address",
      },
      required: "You must provide an address to send funds to",
    },
  ],
};

export function Edit(p: { next: (data: SendData) => void; back: () => void }) {
  const Layout = useLayoutTemplate();

  const controller = useForm<SendData>({
    defaultValues: {
      amount: "10",
    },
  });

  return (
    <Layout
      header={form.title}
      body={<FormProcessor<SendData> controller={controller} formData={form} />}
      footer={
        <Horizontal right gap>
          <Button onClick={p.back} color="gray">
            Cancel
          </Button>
          <Button onClick={controller.handleSubmit(p.next)}>
            Give me coins!
          </Button>
        </Horizontal>
      }
    />
  );
}

export function Success({ next }: { next: () => void }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout
      header="Funds have been minted"
      body={<div>Your should see funds in your wallet</div>}
      footer={
        <Horizontal gap>
          <Button onClick={next}>Close</Button>
        </Horizontal>
      }
    />
  );
}

export function Inflight({ data }: { data: SendData }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout header={`Sending funds...`}>
      <Horizontal>
        <Vertical center>
          <div className="text-md mb-3">
            <div className="text-center">
              Sending {data.amount} {data.currency} to
              <br />
              {data.address}
            </div>
          </div>
          <Horizontal>
            <Spinner size="xl" />
          </Horizontal>
        </Vertical>
      </Horizontal>
    </Layout>
  );
}

export function Error({ next }: { next: () => void }) {
  const Layout = useLayoutTemplate();
  return (
    <Layout
      header="Oh snap!"
      body={<div>It was a failure!</div>}
      footer={
        <Horizontal gap>
          <Button onClick={next}>Close</Button>
        </Horizontal>
      }
    />
  );
}

import React, { FC, useEffect, useState } from "react";
import { useFiles } from "../FileContext";
import { Button, Flex, Input, Layout, message, Typography } from "antd";
import * as colors from "@ant-design/colors";

export const FMCB: FC = () => {
  const { handle } = useFiles();
  const [text, setText] = useState("");
  useEffect(() => {
    if (handle) {
      handle.getFileHandle("FREEMCB.CNF").then(async (cnf) => {
        const file = await cnf.getFile();
        setText(await file.text());
      });
    }
  }, [handle]);

  const save = () => {
    if (handle) {
      handle.getFileHandle("FREEMCB.CNF", {create: true,}).then(async (cnf) => {
        const writable = await cnf.createWritable();
        await writable.write(text);
        await writable.close();
        message.success("Saved!");
      });
    }
  }

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Layout.Header
        style={{
          backgroundColor: colors.blue[5],
        }}
      >
        <Flex align={"center"} style={{ height: "100%" }}>
          <Typography.Title level={4} style={{ margin: 0, color: "white" }}>
            Free McBoot Configurator
          </Typography.Title>
        </Flex>
      </Layout.Header>
      <Layout.Content
        style={{ flex: 1, height: 0, overflowY: "auto", padding: "1rem" }}
      >
        <Flex vertical gap={'1rem'}>
          <Flex>
            <Button type={"primary"} onClick={save}>Save</Button>
          </Flex>
          <Input.TextArea value={text} onChange={(e) => setText(e.target.value)} rows={20} />
        </Flex>
      </Layout.Content>
    </Layout>
  );
};

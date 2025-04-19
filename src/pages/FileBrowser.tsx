import { Flex, Layout, List, Typography } from "antd";
import * as colors from "@ant-design/colors";
import { FileOutlined, FolderOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useFiles } from "../FileContext";

export const FileBrowser = () => {
  const [files, setFiles] = useState<
    [string, FileSystemDirectoryHandle | FileSystemFileHandle][]
  >([]);
  const { handle } = useFiles();

  useEffect(() => {
    if (handle) {
      readFileTree(handle);
    }
  }, [handle]);

  const readFileTree = async (directory: FileSystemDirectoryHandle) => {
    const fileList: [
      string,
      FileSystemDirectoryHandle | FileSystemFileHandle,
    ][] = [];
    for await (const entry of directory.entries()) {
      fileList.push(entry);
    }
    setFiles(fileList);
  };
  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Layout.Header
        style={{
          backgroundColor: colors.blue[5],
        }}
      >
        <Flex align={"center"} style={{ height: "100%" }}>
          <Typography.Title level={4} style={{ margin: 0, color: "white" }}>
            File Browser
          </Typography.Title>
        </Flex>
      </Layout.Header>
      <Layout.Content
        style={{ flex: 1, height: 0, overflowY: "auto", padding: "1rem" }}
      >
        <List
          style={{ height: "min-content" }}
          dataSource={files}
          renderItem={([name, data]) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  data.kind == "directory" ? (
                    <FolderOutlined />
                  ) : (
                    <FileOutlined />
                  )
                }
                title={name}
              />
            </List.Item>
          )}
        />
      </Layout.Content>
    </Layout>
  );
};

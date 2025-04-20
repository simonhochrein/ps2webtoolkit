import {
  Breadcrumb,
  Flex,
  Layout,
  List,
  Table,
  TableColumnsType,
  Typography,
} from "antd";
import * as colors from "@ant-design/colors";
import { FileOutlined, FolderOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useFiles } from "../FileContext";
import byteSize from "byte-size";

const columns: TableColumnsType<FileEntry> = [
  {
    key: "icon",
    width: 40,
    render(v, entry) {
      return entry.kind == "directory" ? <FolderOutlined /> : <FileOutlined />;
    },
  },
  {
    key: "name",
    dataIndex: "name",
    title: "Name",
  },
  {
    key: "size",
    dataIndex: "size",
    title: "Size",
  },
];

export type FileEntry = {
  kind: string;
  name: string;
  size: string;
};

export const FileBrowser = () => {
  const [stack, setStack] = useState<string[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const { handle } = useFiles();

  useEffect(() => {
    async function main() {
      if (handle) {
        if (stack.length > 0) {
          let subdir = handle;
          for (const entry of stack) {
            subdir = await subdir.getDirectoryHandle(entry);
          }
          readFileTree(subdir);
        } else {
          readFileTree(handle);
        }
      }
    }

    main();
  }, [handle, stack]);

  const readFileTree = async (directory: FileSystemDirectoryHandle) => {
    const fileList: FileEntry[] = [];
    for await (const [name, entry] of directory.entries()) {
      let size = "";
      if (entry.kind == "file") {
        const file = await (entry as FileSystemFileHandle).getFile();
        size = byteSize(file.size).toString();
      }
      fileList.push({
        kind: entry.kind,
        name: name,
        size,
      });
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
        <Breadcrumb
          itemRender={(v) =>
            v.key == stack.length ? (
              v.title
            ) : (
              <a onClick={v.onClick}>{v.title}</a>
            )
          }
          items={[
            {
              key: 0,
              title: "Root",
              onClick: () => setStack([]),
            },
            ...stack.map((item, i) => ({
              key: i + 1,
              title: item,
              onClick: () => setStack(stack.slice(0, i + 1)),
            })),
          ]}
        ></Breadcrumb>
        <Table
          rowKey={"name"}
          style={{ height: "min-content" }}
          dataSource={files}
          pagination={false}
          columns={columns}
          onRow={(row) => ({
            onClick: (event) => {
              if (row.kind == "directory") {
                setStack([...stack, row.name]);
              }
            },
          })}
        />
      </Layout.Content>
    </Layout>
  );
};

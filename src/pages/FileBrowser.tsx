import {
  Breadcrumb,
  Flex,
  Layout,
  Table,
  TableColumnsType,
  Typography,
} from "antd";
import * as colors from "@ant-design/colors";
import { FileOutlined, FolderOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useFiles } from "../FileContext";
import byteSize from "byte-size";
import { PS2WTLayout } from "../layout";

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
    <PS2WTLayout title={"File Browser"}>
      <Flex gap={"1rem"} vertical>
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
        />
        <Table
          rowKey={"name"}
          style={{ height: "min-content" }}
          dataSource={files}
          pagination={false}
          columns={columns}
          onRow={(row) => ({
            onClick: () => {
              if (row.kind == "directory") {
                setStack([...stack, row.name]);
              }
            },
          })}
        />
      </Flex>
    </PS2WTLayout>
  );
};

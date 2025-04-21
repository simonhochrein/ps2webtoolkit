import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import { useFiles } from "../FileContext";
import {
  Button,
  Flex,
  Layout,
  message,
  Table,
  TableColumnsType,
  Typography,
} from "antd";
import * as colors from "@ant-design/colors";
import { HolderOutlined } from "@ant-design/icons";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { PS2WTLayout } from "../layout";

type CNF = Record<string, string>;

function parseCNF(text: string): CNF {
  const map = {};
  text.split("\n").forEach((line) => {
    const [key, value] = line.split("=", 2);
    map[key.trim()] = value?.trim() ?? "";
  });

  return map;
}

type BootEntry = {
  name: string;
  paths: string[];
};

function getOSDSYSItems(cnf: CNF) {
  let map: Record<string, BootEntry> = {};
  for (const key in cnf) {
    if (key.includes("OSDSYS_ITEM")) {
      const match = /([a-z0-9]+)_OSDSYS_ITEM_([0-9]+)/.exec(key);
      if (!map[match[2]]) {
        map[match[2]] = {
          name: "",
          paths: [],
        };
      }
      if (match[1].startsWith("path")) {
        map[match[2]].paths.push(cnf[key]);
      } else if (match[1] == "name") {
        map[match[2]].name = cnf[key];
      }
    }
  }
  return Object.entries(map)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([, a]) => a);
}

const bootEntryColumns: TableColumnsType<BootEntry> = [
  { key: "sort", align: "center", width: 80, render: () => <DragHandle /> },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Path",
    dataIndex: "paths",
    key: "path",
    render: (v, entry) => entry.paths[0],
  },
];

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: "move" }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const Row: FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });
  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

export const FMCB: FC = () => {
  const { handle } = useFiles();
  // const [text, setText] = useState("");
  const [cnf, setCnf] = useState<CNF>({});
  const [bootEntries, setBootEntries] = useState<BootEntry[]>([]);

  useEffect(() => {
    if (handle) {
      handle.getFileHandle("FREEMCB.CNF").then(async (cnfFile) => {
        const file = await cnfFile.getFile();
        const text = await file.text();
        const cnf = parseCNF(text);
        setCnf(
          Object.fromEntries(
            Object.entries(cnf).filter(([key]) => !key.includes("OSDSYS_ITEM")),
          ),
        );
        setBootEntries(getOSDSYSItems(cnf));
        // setText(text);
      });
    }
  }, [handle]);

  const save = () => {
    if (handle) {
      handle
        .getFileHandle("FREEMCB.CNF", { create: true })
        .then(async (output) => {
          let text = "";
          for (const key in cnf) {
            text += `${key} = ${cnf[key]}\n`;
          }

          for (let i = 0; i < bootEntries.length; i++) {
            text += `name_OSDSYS_ITEM_${i} = ${bootEntries[i].name}\n`;
            for (let j = 0; j < bootEntries[i].paths.length; j++) {
              text += `path${j}_OSDSYS_ITEM_${i} = ${bootEntries[i].paths[j]}\n`;
            }
          }
          // console.log(text);
          const writable = await output.createWritable();
          await writable.write(text);
          await writable.close();
          message.success("Saved!");
        });
    }
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setBootEntries((prevState) => {
        const activeIndex = prevState.findIndex(
          (record) => record.name === active?.id,
        );
        const overIndex = prevState.findIndex(
          (record) => record.name === over?.id,
        );
        return arrayMove(prevState, activeIndex, overIndex);
      });
    }
  };

  return (
    <PS2WTLayout title={"FreeMcBoot Settings"}>
      <Flex vertical gap={"1rem"}>
        <Flex>
          <Button type={"primary"} onClick={save}>
            Save
          </Button>
        </Flex>
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            items={bootEntries.map((e) => e.name)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              rowKey={"name"}
              components={{ body: { row: Row } }}
              dataSource={bootEntries}
              columns={bootEntryColumns}
            />
          </SortableContext>
        </DndContext>
        {/*<Input.TextArea value={text} onChange={(e) => setText(e.target.value)} rows={20} />*/}
      </Flex>
    </PS2WTLayout>
  );
};

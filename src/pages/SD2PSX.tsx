import React, { FC, useEffect, useMemo, useState } from "react";
import { useFiles } from "../FileContext";
import {
  Button,
  Flex,
  Modal,
  Progress,
  Space,
  Typography,
} from "antd";
import { FileSystem } from "../FileSystem";
import { PS2WTLayout } from "../layout";
import { Archive } from "../Archive";
import { StaticAssets, StaticFile } from "../StaticAssets";

const imagePresets = [
  {
    key: "fmcb1966",
    label: "FreeMcBoot 1.966",
  },
  {
    key: "fmcb1965",
    label: "FreeMcBoot 1.965",
  },
  {
    key: "fmcb1964",
    label: "FreeMcBoot 1.964",
  },
  {
    key: "fmcb1963",
    label: "FreeMcBoot 1.963",
  },
  {
    key: "fmcb1953",
    label: "FreeMcBoot 1.953",
  },
  {
    key: "ps2bbl",
    label: "PS2BBL",
  },
  {
    key: "opentuna",
    label: "OpenTuna",
  },
];

export const SD2PSX: FC = () => {
  const { handle } = useFiles();
  const fs = useMemo(() => {
    if (handle) {
      return new FileSystem(handle);
    }
  }, [handle]);
  const [initialized, setInitialized] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (handle) {
      handle
        .getDirectoryHandle("MemoryCards")
        .then(() => {
          setInitialized(true);
        })
        .catch((e) => {
          if (e.name == "NotFoundError") {
            setInitialized(false);
          }
        });
    }
  }, [handle]);

  useEffect(() => {
    if (initialized) {
      fs.readFile(".sd2psx/settings.ini").then((config) => {
        setText(config);
      });
    }
  }, [initialized]);

  const handleSetup = async () => {
    setSetupOpen(true);
    const res = await StaticAssets.fetch(StaticFile.MEMORYCARDS_ZIP);
    const archive = new Archive(fs);
    archive.extract(res, (progress) => {
      setProgress(progress);
      if (progress == 1) {
        setTimeout(() => {
          setSetupOpen(false);
          setInitialized(true);
        }, 1000);
      }
    });
  };

  return (
    <PS2WTLayout title={"SD2PSX"}>
      {handle &&
        (initialized ? (
          <Flex vertical>
            <Typography.Title>Ready to go!</Typography.Title>
            <pre>{text}</pre>
          </Flex>
        ) : (
          <Flex vertical>
            <Typography.Paragraph>SD2PSX not configured</Typography.Paragraph>
            <div>
              <Button type={"primary"} onClick={handleSetup}>
                Setup
              </Button>
            </div>
          </Flex>
        ))}
      <Modal
        open={setupOpen}
        title={"Extracting MemoryCard"}
        footer={null}
        closable={false}
      >
        <Space style={{ width: "100%", display: "block" }}>
          <Flex vertical justify={"stretch"}>
            <Progress percent={Math.round(progress * 100)} />
          </Flex>
        </Space>
      </Modal>
    </PS2WTLayout>
  );
};

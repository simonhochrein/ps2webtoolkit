import React, { FC, useEffect, useMemo, useState } from "react";
import { useFiles } from "../FileContext";
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import { FileSystem } from "../FileSystem";
import { PS2WTLayout } from "../layout";
import { Archive } from "../Archive";
import { StaticAssets, StaticFile } from "../StaticAssets";
import { IniWriter, IniParser, Ini } from "../Ini";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { isWindows } from "../platform";

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

const PSModel = ["PS1", "PS2"] as const;

const PSVariant = ["RETAIL", "PROTO", "ARCADE"] as const;

const CardSize = ["1", "2", "4", "8", "16", "32", "64"] as const;
type CardSizeType = (typeof CardSize)[number];

type SD2PSXSettings = {
  General: {
    Mode: (typeof PSModel)[number];
    FlippedScreen: boolean;
  };
  PS1: {
    Autoboot: boolean;
    GameID: boolean;
  };
  PS2: {
    Autoboot: boolean;
    GameID: boolean;
    CardSize: (typeof CardSize)[number];
    Variant: (typeof PSVariant)[number];
  };
};

export const SettingsEditor: FC = () => {
  const { handle, fs } = useFiles();
  const [ini, setIni] = useState<SD2PSXSettings>(null);
  const { lg } = useBreakpoint();

  useEffect(() => {
    if(!isWindows) {
      load();
    }
  }, [handle]);

  const load = () => {
    new IniParser(fs)
      .read<SD2PSXSettings>(".sd2psx/settings.ini")
      .then((settings) => {
        setIni(settings);
      });
  }

  const onValuesChange = (_value, newState) => {
    setIni(newState);
  };
  const onModeChange = (value) => {
    ini.General.Mode = value;
    setIni({ ...ini });
  };
  const onCardSizeChange = (value) => {
    ini.PS2.CardSize = value;
    setIni({ ...ini });
  };
  const onVariantChange = (value) => {
    ini.PS2.Variant = value;
    setIni({ ...ini });
  };

  const onSave = async () => {
    await new IniWriter(fs).write(".sd2psx/settings.ini", ini);
    message.success("SD2PSX Configuration Saved");
  };

  if (!ini) {
    if(isWindows) {
      return <Button onClick={load}>Select settings.ini</Button>;
    } else {
      return null;
    }
  }

  return (
    <Form
      name={"settings_ini"}
      autoComplete={"off"}
      initialValues={ini}
      onValuesChange={onValuesChange}
    >
      <Row>
        <Col span={24} lg={{ span: 6 }}>
          <Flex vertical style={{ padding: "1rem" }}>
            <Typography.Title level={2} style={{ marginTop: 0 }}>
              General
            </Typography.Title>
            <Form.Item<keyof typeof PSModel>
              label={"Mode"}
              name={["General", "Mode"]}
            >
              <Select
                onChange={onModeChange}
                options={PSModel.map((model) => ({
                  key: model,
                  label: model,
                  value: model,
                }))}
              />
            </Form.Item>
            <Form.Item<boolean>
              label={"Flipped Screen"}
              name={["General", "FlippedScreen"]}
            >
              <Switch />
            </Form.Item>
          </Flex>
        </Col>
        <Col
          span={24}
          lg={{ span: 3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Divider
            type={lg ? "vertical" : "horizontal"}
            style={{ height: "100%" }}
          />
        </Col>
        <Col span={24} lg={{ span: 6 }}>
          <Flex vertical style={{ padding: "1rem" }}>
            <Typography.Title level={2} style={{ marginTop: 0 }}>
              PS1
            </Typography.Title>
            <Form.Item<boolean> label={"Autoboot"} name={["PS1", "Autoboot"]}>
              <Switch />
            </Form.Item>
            <Form.Item<boolean> label={"Game ID"} name={["PS1", "GameID"]}>
              <Switch />
            </Form.Item>
          </Flex>
        </Col>
        <Col
          span={24}
          lg={{ span: 3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Divider
            type={lg ? "vertical" : "horizontal"}
            style={{ height: "100%" }}
          />
        </Col>
        <Col span={24} lg={{ span: 6 }}>
          <Flex vertical style={{ padding: "1rem" }}>
            <Typography.Title level={2} style={{ marginTop: 0 }}>
              PS2
            </Typography.Title>
            <Form.Item<boolean> label={"Autoboot"} name={["PS2", "Autoboot"]}>
              <Switch />
            </Form.Item>
            <Form.Item<boolean> label={"Game ID"} name={["PS2", "GameID"]}>
              <Switch />
            </Form.Item>
            <Form.Item<boolean> label={"CardSize"} name={["PS2", "CardSize"]}>
              <Select
                onChange={onCardSizeChange}
                options={CardSize.map((size) => ({
                  key: size,
                  label: size,
                  value: size,
                }))}
              />
            </Form.Item>
            <Form.Item<keyof typeof PSVariant>
              label={"Variant"}
              name={["PS2", "Variant"]}
            >
              <Select
                onChange={onVariantChange}
                options={PSVariant.map((model) => ({
                  key: model,
                  label: model,
                  value: model,
                }))}
              />
            </Form.Item>
          </Flex>
        </Col>
      </Row>
      <Flex justify={"center"}>
        <Space>
          <Button type={"primary"} onClick={onSave} size={"large"}>
            Save
          </Button>
        </Space>
      </Flex>
    </Form>
  );
};

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
            <SettingsEditor />
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

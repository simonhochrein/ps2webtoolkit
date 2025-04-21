import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  ConfigProvider,
  Flex,
  Layout,
  List,
  Menu,
  MenuProps,
  Typography,
} from "antd";
import * as colors from "@ant-design/colors";
import { DBProvider, SAVED_DIRECTORY_KEY, useDB } from "./db";
import {
  AppstoreAddOutlined,
  CodeOutlined,
  FileOutlined,
  FolderOutlined,
  FormatPainterOutlined,
  PlusCircleFilled,
  UploadOutlined,
} from "@ant-design/icons";
import { FileProvider, useFiles } from "./FileContext";
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useRoutes,
} from "react-router";
import { FileBrowser } from "./pages/FileBrowser";
import { FMCB } from "./pages/FMCB";
import { SD2PSX } from "./pages/SD2PSX";

type MenuItem = Required<MenuProps>["items"][number];

function isSupportedBrowser() {
  return !!window.showDirectoryPicker;
}

const Page = () => {
  const { load, handle } = useFiles();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const key = useMemo(() => {
    return pathname.split("/").pop();
  }, [pathname]);

  const handleNavigation = (e) => {
    navigate({
      pathname: `/${e.key}`,
    });
  };

  const items = useMemo<MenuItem[]>(() => {
    return [
      {
        key: "",
        label: "File Browser",
        icon: <FolderOutlined />,
      },
      {
        key: "format",
        label: "Format",
        icon: <FormatPainterOutlined />,
        disabled: true,
      },
      {
        key: "templates",
        label: "Templates",
        icon: <AppstoreAddOutlined />,
        disabled: true,
      },
      {
        key: "sd2psx",
        label: "SD2PSX",
        icon: <CodeOutlined />,
      },
      {
        key: "fmcb",
        label: "Free McBoot",
        icon: <CodeOutlined />,
      },
    ];
  }, [handle]);

  return (
    <Layout style={{ flex: 1 }}>
      <Layout.Sider width={"16rem"} style={{ backgroundColor: "#ffffff" }}>
        <Flex style={{ height: "100%" }} vertical>
          <Flex
            style={{ padding: "1rem" }}
            vertical
            justify="center"
            gap={"1rem"}
          >
            <Typography style={{ fontSize: "20px" }}>
              PS2 Web Toolkit
            </Typography>
          </Flex>
          <Menu
            onClick={handleNavigation}
            selectedKeys={[key]}
            style={{ flex: 1 }}
            items={items}
            mode={"inline"}
          />
          <div
            style={{
              padding: "1rem",
              display: "flex",
              justifyContent: "stretch",
            }}
          >
            <Button
              type={"primary"}
              icon={<UploadOutlined />}
              style={{ flex: 1 }}
              onClick={() => load()}
            >
              Open Folder
            </Button>
          </div>
        </Flex>
      </Layout.Sider>
      <Layout.Content>
        <Routes>
          <Route path="/" Component={FileBrowser} />
          <Route path="/sd2psx" Component={SD2PSX} />
          <Route path="/fmcb" Component={FMCB} />
        </Routes>
      </Layout.Content>
    </Layout>
  );
};

export const App = () => {
  if (!isSupportedBrowser()) {
    return (
      <Flex style={{ flex: 1, padding: "1rem" }} vertical>
        <Alert
          message={"Unsupported Browser"}
          description={
            "Please download Google Chrome or another browser that supports File System Access API"
          }
          type={"error"}
        />
      </Flex>
    );
  }

  return (
    <DBProvider>
      <ConfigProvider>
        <FileProvider>
          <AntApp style={{ height: "100%", display: "flex" }}>
            <HashRouter>
              <Page />
            </HashRouter>
          </AntApp>
        </FileProvider>
      </ConfigProvider>
    </DBProvider>
  );
};

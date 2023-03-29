import express from "express"
import { Request, Response } from "express"
import { Context } from "@keystone-6/core/dist/declarations/src/types/schema/graphql-ts-schema"
import { array } from "prop-types"

let router = express.Router()
router.use(express.json())
router.get('/app_type/list', listAppTypes)
router.post('/app_version/check_update', checkUpdate)

async function listAppTypes(req: Request, res: Response) {
  let context: Context = res.locals.context
  await context.query.Type.findMany({
    orderBy: [{ id: 'asc' }],
    query: 'id name createTime updateTime'
  }).then((value) => {
    res.json({
      "data": value.map((item) => {
        return {
          "id": item.id,
          "name": item.name,
          "platform": "changan",
          "createTime": Math.floor(new Date(item.createTime).getTime()/1000),
          "updateTime": Math.floor(new Date(item.updateTime).getTime()/1000),
        }
      }),
      "debug_msg":null,
      "request_id":"kk-F1bY12sc7K858bi8",
      "result_code":"success",
      "server_time": Math.floor(new Date().getTime()/1000)
    })
  });
}

async function checkUpdate(req: Request, res: Response) {
  let typeID: number = req.body.app_type
  if (typeID !== undefined && typeID !== null) {
    return getApps(req, res)
  }
  let versionList: any[] = req.body.package_version_list
  if (versionList != undefined &&
      versionList[0] != undefined &&
      versionList[0].package_name != undefined &&
      versionList[0].version_code != undefined) {
    return getUpdatedApps(req, res)
  }
  return error("unknown request", res)
}

async function getApps(req: Request, res: Response) {
  let context: Context = res.locals.context
  let typeID: number = req.body.app_type
  if (typeID == undefined || typeID == null) {
    res.status(400).json({message: "app_type is missing."});
    return
  }
  await context.query.Type.findOne({
    where: { id: typeID.toString() },
    query: 'apps { id name description owner {name} releaseTime apk {filesize url} logo {url} packageName versionCode versionName supportHorizontalKeyboard showStatusBar }'
  }).then((value) => {
    let apps = value.apps.map((item) => {
      return {
        "id": item.id,
        "app_name": item.name,
        "description": item.description,
        "release_time": Math.floor(new Date(item.releaseTime).getTime()/1000),
        "package_name": item.packageName,
        "package_url": item.apk.url,
        "package_size": item.apk.filesize,
        "logo_image_url": item.logo.url,
        "version_code": item.versionCode,
        "version_name": item.version_name,
        "show_status_bar": item.showStatusBar,
        "support_horizontal_key_board": item.supportHorizontalKeyboard,
        "owner": item.owner.name,
        "download_times": 114514,
        "min_os_version": "",
        "preinstall_type": 3,
        "status": 1
      }
    })
    res.json({
      "data": {
        "has_more": false,
        "total": value.apps.length,
        "list": apps
      },
      "debug_msg":null,
      "request_id":"kk-F1bY12sc7K858bi8",
      "result_code":"success",
      "server_time": Math.floor(new Date().getTime()/1000)
    });
  });
}

async function getUpdatedApps(req: Request, res: Response) {
  let context: Context = res.locals.context
  let versionList: any[] = req.body.package_version_list
  let apps: any[] = [];
  for (let pkg of versionList) {
    let name:string = pkg.package_name;
    let ver:number = pkg.version_code;
    await context.query.App.findOne({
      where: { packageName: name },
      query: 'id name description owner {name} releaseTime apk {filesize url} logo {url} packageName versionCode versionName supportHorizontalKeyboard showStatusBar'
    }).then((value) => {
      if (value == null || value.versionCode <= ver) { return; }
      apps.push({
        "id": value.id,
        "app_name": value.name,
        "description": value.description,
        "release_time": Math.floor(new Date(value.releaseTime).getTime()/1000),
        "package_name": value.packageName,
        "package_url": value.apk.url,
        "package_size": value.apk.filesize,
        "logo_image_url": value.logo.url,
        "version_code": value.versionCode,
        "version_name": value.version_name,
        "show_status_bar": value.showStatusBar,
        "support_horizontal_key_board": value.supportHorizontalKeyboard,
        "owner": value.owner.name,
        "download_times": 114514,
        "min_os_version": "",
        "preinstall_type": 3,
        "status": 1
      });
    });
  }
  res.json({
    "data": {
      "has_more": false,
      "total": apps.length,
      "list": apps
    },
    "debug_msg":null,
    "request_id":"kk-F1bY12sc7K858bi8",
    "result_code":"success",
    "server_time": Math.floor(new Date().getTime()/1000)
  });
}

function error(msg: string, res: Response) {
  res.json({
    "debug_msg": msg,
    "request_id":"kk-F1bY12sc7K858bi8",
    "result_code":"invalid_param",
    "server_time": Math.floor(new Date().getTime()/1000)
  })
}

export default router
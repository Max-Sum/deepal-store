import express from "express"
import { Request, Response } from "express"
import { Context } from "@keystone-6/core/dist/declarations/src/types/schema/graphql-ts-schema"

let router = express.Router()
router.use(express.json())
router.get('/app_type/list', listAppTypes)
router.post('/app_version/check_update', getApps)

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

async function getApps(req: Request, res: Response) {
  let context: Context = res.locals.context
  let typeID: number = req.body.app_type
  if (typeID == undefined || typeID == null) {
    res.status(400).json({message: "app_type is missing."});
    return
  }
  await context.query.Type.findOne({
    where: { id: typeID.toString() },
    query: 'apps { id name description owner {name} releaseTime apk {filesize url} logo {url} versionCode versionName supportHorizontalKeyboard showStatusBar }'
  }).then((value) => {
    let apps = value.apps.map((item) => {
      return {
        "id": item.id,
        "app_name": item.name,
        "description": item.description,
        "release_time": Math.floor(new Date(item.releaseTime).getTime()/1000),
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

export default router
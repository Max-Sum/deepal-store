import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { Apk } from "node-apk";

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  file,
  image,
  checkbox,
  integer
} from '@keystone-6/core/fields';

export const lists = {
  User: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // this is the fields for our User list
    fields: {
      // by adding isRequired, we enforce that every User should have a name
      //   if no name is provided, an error will be displayed
      name: text({ validation: { isRequired: true } }),

      email: text({
        validation: { isRequired: true },
        // by adding isIndexed: 'unique', we're saying that no user can have the same
        // email as another user - this may or may not be a good idea for your project
        isIndexed: 'unique',
      }),

      password: password({ validation: { isRequired: true } }),

      createdAt: timestamp({
        // this sets the timestamp to Date.now() when the user is first created
        defaultValue: { kind: 'now' },
      }),

      apps: relationship({ ref: 'App.owner', many: true }),
    },
  }),

  App: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // this is the fields for our App list
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: text({ validation: { isRequired: true } }),
      releaseTime: timestamp({ db: { isNullable: false,updatedAt: true } }),
      owner: relationship({
        // we could have used 'User', but then the relationship would only be 1-way
        ref: 'User.apps',

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineConnect: true,
        },
      }),
      type: relationship({
        ref: 'Type.apps',
        many: false,
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
      }),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        defaultValue: 'draft',
        ui: { displayMode: 'segmented-control' },
      }),
      apk: file({
        storage: 'apps',
        hooks: {
          validateInput: async ({
            resolvedData,
            fieldKey,
            addValidationError,
          }) => {
            const apkFile = resolvedData[fieldKey];
            if (apkFile.filename === undefined) { return; }
            if (apkFile.filesize === null || apkFile.filesize === 0) {
              addValidationError("Missing apk file");
              return;
            }
            if (!apkFile.filename.toLowerCase().endsWith('.apk')) {
              addValidationError("Package only accepts .apk file");
              return;
            }
          }
        }
      }),
      logo: image({
        storage: 'imgs',
        hooks: {
          validateInput: async ({
            resolvedData,
            fieldKey,
            addValidationError
          }) => {
            const logoFile = resolvedData[fieldKey];
            if (logoFile.filesize === undefined) { return; }
            if (logoFile.filesize === null || logoFile.filesize === 0) {
              addValidationError("Missing logo file");
              return;
            }
          }
        }
      }),
      showStatusBar: checkbox({ defaultValue: false }),
      supportHorizontalKeyboard: checkbox({ defaultValue: true }),
      versionName: text({ui: { createView: { fieldMode: 'hidden' }, itemView: {fieldMode: 'hidden'} }}),
      versionCode: integer({ui: { createView: { fieldMode: 'hidden' }, itemView: {fieldMode: 'hidden'} }}),
      packageName: text({ui: { createView: { fieldMode: 'hidden' }, itemView: {fieldMode: 'hidden'} }})
    },

    hooks: {
      resolveInput:async ({
        resolvedData,
      }) => {
        if (resolvedData['apk'].filename === undefined) {
          return resolvedData;
        }
        try {
          const apk = new Apk('public/apps/' + resolvedData['apk'].filename);
          await apk.getManifestInfo().then((manifest) => {
            if (resolvedData['name'] === null) {
              resolvedData['name'] = manifest.applicationLabel;
            }
            resolvedData['versionCode'] = manifest.versionCode;
            resolvedData['versionName'] = manifest.versionName;
            resolvedData['packageName'] = manifest.package;
          })
        }
        catch(exception) {
          console.error(exception);
        }
        return resolvedData;
      }
    }
  }),

  // this last list is our Tag list, it only has a name field for now
  Type: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // this is the fields for our Tag list
    fields: {
      name: text({ validation: { isRequired: true } }),
      apps: relationship({ ref: 'App.type', many: true }),
      createTime: timestamp({ defaultValue: { kind: 'now' } }),
      updateTime: timestamp({ db: { isNullable: false,updatedAt: true } }),
    },
  }),
};

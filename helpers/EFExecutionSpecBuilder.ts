/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import fs from 'fs'
import { parseOpenRPCDocument } from '@open-rpc/schema-utils-js'
import { ContentDescriptorObject, MethodObject, OpenrpcDocument } from '@open-rpc/meta-schema'
import { IsBlockRequest, IsTxReceiptRequest, IsTxRequest } from './rpcMethods'
import {
  isArbitrumNetwork,
  isAvalancheNetwork,
  isCeloAlfajores,
  isCeloNetwork,
  isEthereumNetwork,
  isPalmNetwork,
  isPolygonNetwork,
} from './globals'

// This relies on the openrpc.json file that has been built from the ef-execution-specs submodule
// To refresh that:
// 1) Run `git submodule update --init --remote --recursive`
// 2) Go in the ef-execution-specs folder
// 3) Run npm install
// 4) Run node scripts/build.js
// 5) Copy/paste the new openrpc.json obtained in the helpers/assets folder
export default class EFExecutionSpecBuilder {
  private openrpc: string

  private schema: OpenrpcDocument

  constructor() {
    this.openrpc = JSON.parse(fs.readFileSync('./assets/openrpc.json', 'utf-8'))
  }

  public getSpecsSchema = async (): Promise<OpenrpcDocument> => {
    if (!this.schema) {
      this.schema = await parseOpenRPCDocument(this.openrpc)
      return this.schema
    }
    return this.schema
  }

  public getRpcSchema = async (rpcMethod: string): Promise<any> => {
    if (!this.schema) {
      this.schema = await parseOpenRPCDocument(this.openrpc)
    }

    const tmp = this.schema.methods.filter((m) => (m as MethodObject).name === rpcMethod)[0] as MethodObject
    const { schema } = tmp.result as ContentDescriptorObject
    this.txSchemaTypeCleanup(rpcMethod, schema)
    this.blockSchemaTypeCleanup(rpcMethod, schema)
    return schema
  }

  private txSchemaTypeCleanup = async (rpcMethod, schema) => {
    // set additionalProperties to true as some L2 add additional props like gasUsedForL1,l1BlockNumber
    if (!isEthereumNetwork && !isPolygonNetwork && IsTxReceiptRequest(rpcMethod)) {
      for (const [index, value] of schema.oneOf.entries()) {
        if ((value as ContentDescriptorObject).title.includes('Receipt information')) {
          schema.oneOf[index].additionalProperties = true
          if (isPalmNetwork) {
            const itemIndex = schema.oneOf[index].required.indexOf('effectiveGasPrice')
            if (itemIndex > -1) schema.oneOf[index].required.splice(itemIndex, 1)
          }
        }
      }
      return schema
    }
    if (!isEthereumNetwork && IsTxRequest(rpcMethod)) {
      for (const [index, value] of schema.oneOf.entries()) {
        if ((value as ContentDescriptorObject).title.includes('Transaction information')) {
          schema.oneOf[index].oneOf = schema.oneOf[index].oneOf.filter((f) =>
            (f as ContentDescriptorObject).title.includes('Signed Legacy Transaction')
          )

          // Delete the type as is expecting the 0x0 format not always valid for the L2s e.g. Arbitrum
          delete schema.oneOf[index].oneOf[0].properties.type
        }
      }

      return schema
    }

    return undefined
  }

  private blockSchemaTypeCleanup = async (rpcMethod, schema) => {
    if (!isEthereumNetwork && IsBlockRequest(rpcMethod)) {
      for (const [index, value] of schema.oneOf.entries()) {
        if ((value as ContentDescriptorObject).title.includes('Block object')) {
          schema.oneOf[index].required = schema.oneOf[index].required.filter((f) => f !== 'extraData')
          const tmp = schema.oneOf[index].properties.transactions
          for (const [i, v] of tmp.anyOf.entries()) {
            if (v.title === 'Full transactions') {
              tmp.anyOf[i].items.oneOf = v.items.oneOf.filter((f) =>
                (f as ContentDescriptorObject).title.includes('Signed Legacy Transaction')
              )
              // TODO: Refactor as code above is similar

              // Delete the type as is expecting the 0x0 format not always valid for the L2s e.g. Arbitrum
              delete tmp.anyOf[i].items.oneOf[0].properties.type
            }
          }
          if (isArbitrumNetwork) {
            schema.oneOf[index].additionalProperties = true
            schema.oneOf[index].properties.sendCount = {
              title: 'sendCount',
              type: 'string',
              pattern: '^0x([1-9a-f]+[0-9a-f]*|0)$',
            }
            schema.oneOf[index].properties.sendRoot = {
              title: 'sendRoot',
              type: 'string',
              pattern: '^0x([1-9a-f]+[0-9a-f]*|0)$',
            }
            schema.oneOf[index].properties.l1BlockNumber = {
              title: 'l1BlockNumber',
              type: 'string',
              pattern: '^0x([1-9a-f]+[0-9a-f]*|0)$',
            }
          }
          if (isCeloNetwork || isCeloAlfajores) {
            schema.oneOf[index].additionalProperties = true
            schema.oneOf[index].required.push('epochSnarkData')
            schema.oneOf[index].required.push('extraData')
            schema.oneOf[index].required = schema.oneOf[index].required.filter(
              (f) => f !== 'sha3Uncles' && f !== 'uncles' && f !== 'mixHash' && f !== 'nonce'
            )
          }
          if (isAvalancheNetwork) {
            schema.oneOf[index].additionalProperties = true
            schema.oneOf[index].properties.blockExtraData = {
              title: 'blockExtraData',
              type: 'string',
              pattern: '^0x([1-9a-f]+[0-9a-f])*$',
            }
            schema.oneOf[index].properties.blockGasCost = {
              title: 'blockGasCost',
              type: 'string',
              pattern: '^0x([1-9a-f]+[0-9a-f]*|0)$',
            }
            schema.oneOf[index].properties.extDataGasUsed = {
              title: 'extDataGasUsed',
              type: 'string',
              pattern: '^0x([1-9a-f]+[0-9a-f]*|0)$',
            }
            schema.oneOf[index].properties.extDataHash = {
              title: 'extDataHash',
              type: 'string',
              pattern: '^0x([1-9a-f]+[0-9a-f]*|0)$',
            }
          }
        }
      }
      return schema
    }

    return undefined
  }
}

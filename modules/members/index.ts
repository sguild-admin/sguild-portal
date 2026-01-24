// modules/members/index.ts
// Public exports for the members module.
export * from "./members.actions"
export * from "./members.dto"
export * from "./members.schema"
export * from "./members.routes"

import { unknownToAppError } from "@/modules/_shared/errors"
import {
	getMeAction,
	getMemberByClerkUserIdAction,
	listMembersAction,
	patchMemberByClerkUserIdAction,
} from "./members.actions"

async function getMeSafeAction() {
	try {
		const dto = await getMeAction()
		return { ok: true as const, ...dto }
	} catch (err) {
		const error = unknownToAppError(err)
		return { ok: false as const, code: error.code, message: error.message }
	}
}

export const membersActions = {
	listMembersAction,
	getMeAction: getMeSafeAction,
	getMemberByClerkUserIdAction,
	patchMemberByClerkUserIdAction,
}

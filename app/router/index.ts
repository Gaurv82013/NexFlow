import { createChannel, getChannel, listChannels } from "./channel";
import { inviteMember, listMembers } from "./member";
import { createMessage, listMessages, updateMessage } from "./message";
import { createWorkspace, listWorkspaces } from "./workspace";

export const router={
    workspace:{
        list:listWorkspaces,
        create:createWorkspace,
        member:{
            list:listMembers,
            invite:inviteMember,
        }
    },
    channel:{
        create:createChannel,
        list:listChannels,
        get:getChannel,
    },
    message:{
        create:createMessage,
        list:listMessages,
        update:updateMessage,
    }
}
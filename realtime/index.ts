// index.ts

import { PresenceMessageSchema, UserSchema } from "@/app/schemas/realtime";
import { Connection, routePartykitRequest, Server } from "partyserver";
import z from "zod";

type Env = Cloudflare.Env & {Chat: DurableObjectNamespace<Chat>}

const ConnectionStateSchema = z.object({
    user:UserSchema.nullable().optional(),
}).nullable();

type Connectionstate = z.infer<typeof ConnectionStateSchema>;

type Message= z.infer<typeof PresenceMessageSchema>;

// Define your Server
export class Chat extends Server {

    //Define your server

    static options = {
        hibernate:true,
    };

  onConnect(connection: Connection) {
    console.log("Connected", connection.id, "to server", this.name);

    // Send current presence info to the newly connected client
    connection.send(JSON.stringify(this.getPresenceMessage()));
  }

  onClose(connection: Connection){
    console.log("Disconnected", connection.id, "from server", this.name);

    this.updateUsers();    
  }

  onError(){
    console.error("An error occurred in server", this.name);
    this.updateUsers();
  }

  onMessage(connection : Connection, message:string) {
    // console.log("Message from", connection.id, ":", message);
    // // Send the message to every other connection
    // this.broadcast(message, [connection.id]);
    try{
        const parsed = JSON.parse(message);

        const presence = PresenceMessageSchema.safeParse(parsed);

        if(presence.success){
            if(presence.data.type === "add-user"){
                //store user info in connection metadata
                this.setConnectionState(connection, {user: presence.data.payload});

                //Broadcast presence message to all connections
                this.updateUsers();
                return;
            }

            
            if(presence.data.type === "remove-user"){
                this.setConnectionState(connection, null);
                this.updateUsers();
                return;
            }
        }
        
    }catch{
        console.error("Failed to parse message:", message);
    }
  }

  updateUsers(){
    const presenceMessage = JSON.stringify(this.getPresenceMessage());

    this.broadcast(presenceMessage);
  }

  getPresenceMessage(){
    return {
        type: "presence",
        payload: {
            users:this.getUsers(),
        }
    } satisfies Message;
  }

  getUsers(){
    const users=new Map();

    for (const connection of this.getConnections()){
        const state = this.getConnectionState(connection);

        if(state?.user){
            users.set(state.user.id, state.user);
        }
    }

    return Array.from(users.values());
    
  }

  private setConnectionState(connection:Connection, state:Connectionstate){
    connection.setState(state);
  }

  private getConnectionState(connection:Connection):Connectionstate{
    const result = ConnectionStateSchema.safeParse(connection.state);

    if(result.success){
        return result.data;
    }

    return null;
  }
}

export default {
  // Set up your fetch handler to use configured Servers
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not Found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
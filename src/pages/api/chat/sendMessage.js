import dbConnect from "../../../lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import Message from "@/models/Message";
import Chat from "@/models/Chat";

export default async function handler(req, res) {

  console.time("SEND_MESSAGE_TOTAL");

  if (req.method !== "POST") {
    return res.status(405).json({
      message:"Method not allowed"
    });
  }


  try {

    await dbConnect();

    console.timeLog(
      "SEND_MESSAGE_TOTAL",
      "MongoDB connected"
    );


    const {
      chatId,
      senderId,
      receiverId,
      message
    } = req.body;



    console.log("MESSAGE DATA",{
      chatId,
      senderId,
      receiverId,
      message
    });



    const newMessage = await Message.create({

      chatId,
      senderId,
      receiverId,
      message,
      isSeen:false

    });



    console.timeLog(
      "SEND_MESSAGE_TOTAL",
      "Message created"
    );



    const chat = await Chat.findById(chatId);



    console.timeLog(
      "SEND_MESSAGE_TOTAL",
      "Chat fetched"
    );



    if(!chat){

      return res.status(404).json({

        success:false,
        message:"Chat not found"

      });

    }




    const update={

      lastMessage:message,
      lastMessageSender:senderId,
      lastMessageSeen:false

    };




    if(chat.buyer.toString()===senderId){


      update.buyerUnreadCount=0;

      update.sellerDeleted=false;

      update.$inc={
        sellerUnreadCount:1
      };


    }
    else{


      update.sellerUnreadCount=0;

      update.buyerDeleted=false;

      update.$inc={
        buyerUnreadCount:1
      };


    }




    await Chat.findByIdAndUpdate(
      chatId,
      update
    );



    console.timeLog(
      "SEND_MESSAGE_TOTAL",
      "Chat updated"
    );





    const [sender,receiver]=await Promise.all([

      User.findById(senderId),

      User.findById(receiverId)

    ]);



    console.timeLog(
      "SEND_MESSAGE_TOTAL",
      "Users fetched"
    );






    if(receiver && receiver.contact){


      const THIRTY_MINUTES =
      30 * 60 * 1000;



      const now=Date.now();



      const lastEmailTime =
      receiver.lastEmailSentAt
      ?
      new Date(
        receiver.lastEmailSentAt
      ).getTime()
      :
      0;



      const shouldSendEmail =
      !receiver.isOnline &&
      (
        lastEmailTime===0 ||
        now-lastEmailTime>=THIRTY_MINUTES
      );




      console.log(
        "📧 SHOULD SEND EMAIL:",
        shouldSendEmail
      );




      if(shouldSendEmail){



        console.timeLog(
          "SEND_MESSAGE_TOTAL",
          "Email started"
        );



        // Fetch product only when email is required

        const chatWithProduct =
        await Chat.findById(chatId)
        .populate(
          "product",
          "title coverImage"
        );



        await sendEmail({

          to:receiver.contact,

          subject:"New message on OnShoper",

          message:`

          <!DOCTYPE html>

          <html>

          <body>

          <h2>
          New Message Received
          </h2>


          <p>
          Hi ${receiver.name}
          </p>


          <p>
          ${sender?.name || "Someone"}
          sent you a message.
          </p>


          ${
            chatWithProduct?.product?.title
            ?
            `
            <h3>
            ${chatWithProduct.product.title}
            </h3>
            `
            :
            ""
          }


          <p>
          Message:
          ${message}
          </p>


          <a href="http://localhost:3000/chat?chatId=${chatId}">
          Reply Now
          </a>


          </body>

          </html>

          `

        });



        console.timeLog(
          "SEND_MESSAGE_TOTAL",
          "Email completed"
        );




        await User.findByIdAndUpdate(
          receiverId,
          {
            lastEmailSentAt:new Date()
          }
        );



      }
      else{


        console.log(
          "❌ EMAIL NOT SENT"
        );


      }


    }





    console.timeEnd(
      "SEND_MESSAGE_TOTAL"
    );



    return res.status(200).json({

      success:true,

      message:newMessage

    });



  }

  catch(error){


    console.log(error);


    return res.status(500).json({

      success:false,

      message:error.message

    });


  }

}
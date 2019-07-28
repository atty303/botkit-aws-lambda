import {Botkit} from 'botkit'
import {SlackBotWorker} from 'botbuilder-adapter-slack'

export const register: (controller: Botkit) => void = (controller) => {
  controller.hears('sample','direct_mention', async (bot, message) => {
    await bot.reply(message, 'I heard a sample message.')
  })

  controller.hears('block_command', 'direct_mention', async (bot, message) => {
    const content = {
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "You have a new request:\n*<fakeLink.toEmployeeProfile.com|Fred Enriquez - New device request>*"
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Approve"
              },
              "style": "primary",
              "value": "approve"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Deny"
              },
              "style": "danger",
              "value": "deny"
            }
          ]
        }
      ]
    }

    await bot.reply(message, content)
  })

  controller.on('message', async (bot, message) => {
    const m = message as any
    if (m.actions && m.actions.length > 0) {
      // { action_id: 'RnXGs', block_id:'7ZU', text:[Object], value:'click_me_123', style:'primary', type:'button', action_ts:'1564277460.204054' }
      const action = m.actions[0]
      if (action.value === 'approve') {
        await (bot as SlackBotWorker).replyInteractive(message, 'Approved')
      } else if (action.value === 'deny') {
        await (bot as SlackBotWorker).replyInteractive(message, 'Denied')
      }
    }
  })

  controller.on('slash_command', async (bot, message) => {
    console.log('slash_command', message)
    if (message.command === '/akanechan') {
      await (bot as SlackBotWorker).replyPublic(message, message.text)
    }
  })
}

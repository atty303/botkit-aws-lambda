import {Botkit} from 'botkit'

export const register: (controller: Botkit) => void = (controller) => {
  controller.hears('sample','direct_mention', async (bot, message) => {
    await bot.reply(message, 'I heard a sample message.')
  })

  controller.on('slash_command', async (bot, message) => {
    if (message.command === 'akanechan') {
      return await (bot as any).replyPublic(message.text)
    }
  })
}

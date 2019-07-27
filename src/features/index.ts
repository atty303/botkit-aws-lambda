import {Botkit} from 'botkit'

export const register: (controller: Botkit) => void = (controller) => {
  controller.hears('sample','message,direct_message', async (bot, message) => {
    await bot.reply(message, 'I heard a sample message.')
  })
}

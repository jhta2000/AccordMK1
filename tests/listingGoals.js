import Bot from '../src/Bot';
import Message from '../src/Message'
import ChatRoom from '../src/ChatRoom'

jest.mock('../src/ChatRoom');

ChatRoom.mockImplementation(() => {
    return{
        sendMessage: jest.fn()
    }
})

describe("Bot", () => {
    let bot;
    let chatRoom;

    beforeEach(() => {
        ChatRoom.mockClear();
        bot = new Bot();
        chatRoom = new ChatRoom();
    })
})
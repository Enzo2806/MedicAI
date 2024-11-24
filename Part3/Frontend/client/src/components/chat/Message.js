import chatstyles from '../../assets/styles/chatstyles.module.css';

function Message({ username, message, isChatBotMessage, createdtime, id }) {
    // 1
    const color = isChatBotMessage ? "#000000" : "#0000FF"
    // 2
    const className = (!isChatBotMessage) ?
        `${chatstyles.messagesMessage} ${chatstyles.currentMember}` : chatstyles.messagesMessage;
    // 3
    return (
        <li key={id} className={className}>
            <span
                className={chatstyles.avatar}
                style={{ backgroundColor: color }}
            />
            <div className={chatstyles.messageContent}>
                <div className={chatstyles.username} style={{ color: 'white' }}>
                    {username}
                    <br />
                    {createdtime}
                </div>
                <div className={chatstyles.text}>{message}</div>
            </div>
        </li>
    );
}

export default Message;
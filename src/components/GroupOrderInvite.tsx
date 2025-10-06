import React, { useState } from 'react';

const GroupOrderInvite: React.FC = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [joined, setJoined] = useState<string[]>([]);
  const [groupCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

  const addEmail = () => {
    if (input && !emails.includes(input)) {
      setEmails([...emails, input]);
      setInput('');
    }
  };

  const joinGroup = (email: string) => {
    if (!joined.includes(email)) setJoined([...joined, email]);
  };

  return (
    <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
      <h3 className="text-xl font-bold text-food-brown mb-2">Group Order Invite</h3>
      <div className="mb-2 text-food-brown">Share this code: <span className="font-mono bg-food-yellow px-2 py-1 rounded">{groupCode}</span></div>
      <div className="flex w-full max-w-sm mb-4">
        <input
          type="email"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter friend's email"
          className="flex-1 px-4 py-2 rounded-l-lg border border-food-brown focus:ring-2 focus:ring-food-yellow focus:border-transparent text-food-brown"
        />
        <button
          type="button"
          className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-4 py-2 rounded-r-lg font-medium"
          onClick={addEmail}
        >
          Invite
        </button>
      </div>
      <div className="w-full max-w-sm">
        <h4 className="text-food-brown font-semibold mb-1">Invited:</h4>
        <ul className="mb-2">
          {emails.map(email => (
            <li key={email} className="flex items-center justify-between bg-food-yellow rounded px-2 py-1 mb-1">
              <span>{email}</span>
              <button
                className="text-food-brown text-xs underline"
                onClick={() => joinGroup(email)}
                disabled={joined.includes(email)}
              >
                {joined.includes(email) ? 'Joined' : 'Mark as Joined'}
              </button>
            </li>
          ))}
        </ul>
        <div className="text-food-brown/70 text-xs">(Demo: click "Mark as Joined" to simulate friends joining)</div>
      </div>
    </section>
  );
};

export default GroupOrderInvite;

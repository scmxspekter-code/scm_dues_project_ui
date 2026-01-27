import { useState } from 'react';
import { generateDuesReminder } from '../services/geminiService';

export type RecipientType = 'defaulters' | 'paid' | 'all' | 'custom';
export type Channel = 'whatsapp' | 'sms';

export const useMessaging = () => {
  const [recipientType, setRecipientType] = useState<RecipientType>('defaulters');
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const content = await generateDuesReminder("[Member Name]", 50000, "Feb 28, 2025");
      setMessage(content);
    } catch (error) {
      console.error('Failed to generate message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    // TODO: Implement send logic
    console.log('Sending message:', { recipientType, channel, message });
  };

  return {
    recipientType,
    setRecipientType,
    channel,
    setChannel,
    message,
    setMessage,
    isGenerating,
    handleAiGenerate,
    handleSend,
  };
};

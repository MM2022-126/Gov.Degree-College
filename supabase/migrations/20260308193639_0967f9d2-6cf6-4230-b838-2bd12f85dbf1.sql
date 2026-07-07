
ALTER TABLE public.chat_messages ADD COLUMN read_at timestamp with time zone DEFAULT NULL;

-- Allow updating chat_messages (for marking as read)
CREATE POLICY "Anyone can update messages" ON public.chat_messages
FOR UPDATE USING (true) WITH CHECK (true);

-- Allow users to delete their own profile (cascades to posts, likes, resonances, blocks, reports)
CREATE POLICY "profiles: delete own" ON profiles FOR DELETE USING (auth.uid() = id);

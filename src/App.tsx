/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import MainLayout from './components/layout/MainLayout';
import ChatWindow from './features/chat/components/ChatWindow';

export default function App() {
  return (
    <MainLayout>
      <ChatWindow />
    </MainLayout>
  );
}

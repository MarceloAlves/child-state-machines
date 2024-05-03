import { Box, Button, Center, Code, Flex } from '@chakra-ui/react'
import { Layout } from './components/Layout'
import { useMachine, useSelector, createActorContext } from '@xstate/react'
import { ControllerMachine } from './sample.machine'
import { createBrowserInspector } from '@statelyai/inspect'

const { inspect } = createBrowserInspector()

const ControllerMachineContext = createActorContext(ControllerMachine, { inspect })

function App() {
  return (
    <ControllerMachineContext.Provider>
      <InnerApp />
    </ControllerMachineContext.Provider>
  )
}

function InnerApp() {
  console.log(`🚀 ~ InnerApp ~ ControllerMachineContext:`, ControllerMachineContext)
  const controllerRef = ControllerMachineContext.useActorRef()
  const state = useSelector(controllerRef, (state) => state)
  const send = controllerRef.send

  const childMachineRef = useSelector(controllerRef, (state) => state.children?.sample)
  const childMachineState = useSelector(childMachineRef, (state) => state)
  console.log(`🚀 ~ App ~ foo:`, childMachineState?.matches('idle'))

  return (
    <Layout>
      <Center>hello</Center>
      <Flex py={4} gap={4}>
        {state.matches('idle') && <Button onClick={() => send({ type: 'FETCH' })}>FETCH</Button>}
        {childMachineState?.matches('idle') && (
          <>
            <Button onClick={() => childMachineRef.send({ type: 'RESOLVE' })}>RESOLVE</Button>
            <Button onClick={() => childMachineRef.send({ type: 'REJECT' })}>REJECT</Button>
            <Button onClick={() => childMachineRef.send({ type: 'UPDATE_PARENT' })}>UPDATE_PARENT</Button>
          </>
        )}
        {state.matches('success') && <Box>SUCCESS</Box>}
        {state.matches('failure') && <Box>FAILURE</Box>}
      </Flex>
      <Code as="pre" w="full" p={4}>
        {JSON.stringify(state, null, 2)}
      </Code>
    </Layout>
  )
}

export default App

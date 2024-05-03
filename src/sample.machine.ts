import { assertEvent, assign, createMachine, sendParent } from 'xstate'

const SampleMachine = createMachine({
  id: 'sample',
  initial: 'idle',
  context: {
    foo: 'bar',
  },
  output: ({ event }) => {
    return event.type.split('.').at(-1)
  },
  states: {
    idle: {
      on: {
        RESOLVE: 'success',
        REJECT: 'failure',
        UPDATE_PARENT: {
          actions: [
            sendParent({
              type: 'UPDATE',
              data: 'hello',
            }),
          ],
        },
      },
    },
    success: {
      type: 'final',
    },
    failure: {
      type: 'final',
    },
  },
})

export const ControllerMachine = createMachine({
  id: 'controller',
  initial: 'idle',
  context: {
    child_message: '',
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      on: {
        UPDATE: {
          actions: [assign({ child_message: ({ event }) => event.data })],
          // actions: [() => console.log('UPDATE')],
        },
      },
      invoke: {
        id: 'sample',
        src: SampleMachine,
        onDone: [{ guard: ({ event }) => event.output === 'success', target: 'success' }, { target: 'failure' }],
        onError: {
          target: 'failure',
          actions: console.error,
        },
      },
    },
    success: {
      type: 'final',
    },
    failure: {
      type: 'final',
    },
  },
})

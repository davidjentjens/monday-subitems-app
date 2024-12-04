import { Flex, Heading, Loader, Text } from 'monday-ui-react-core'

interface TableEmptyStateProps {
  state: 'loading' | 'empty' | 'error'
  itemId?: number
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  state,
  itemId,
}) =>
  state === 'loading' ? (
    <Flex
      direction={Flex.directions.COLUMN}
      align={Flex.align.CENTER}
      justify={Flex.justify.CENTER}
      gap={Flex.gaps.SMALL}
      style={{
        height: 'calc(100vh - 200px)',
        minHeight: '400px',
      }}
    >
      <Heading type={Heading.types.h2} value="Loading subitems..." />
      <Loader size={Loader.sizes.MEDIUM} />
    </Flex>
  ) : state === 'empty' ? (
    <Flex
      direction={Flex.directions.COLUMN}
      gap={Flex.gaps.SMALL}
      aria-labelledby="empty-state-id"
      style={{
        padding: '64px',
        textAlign: 'center',
      }}
    >
      <img
        style={{
          width: '290px',
        }}
        src={
          'https://vibe.monday.com/static/media/emptyStateExample.f5f9c287.svg'
        }
        alt=""
      />
      <Heading
        type={Heading.types.h2}
        id="empty-state-id"
        value={`No subtitems yet for item #${itemId}`}
      />
      <Text>Be the first to add a subitem and start collaborating!</Text>
    </Flex>
  ) : (
    <Flex
      direction={Flex.directions.COLUMN}
      gap={Flex.gaps.SMALL}
      aria-labelledby="error-state-id"
      style={{
        padding: '64px',
        textAlign: 'center',
      }}
    >
      <img
        style={{
          width: '290px',
        }}
        src={
          'https://vibe.monday.com/static/media/errorStateExample.8b0c4d0a.svg'
        }
        alt=""
      />
      <Heading
        type={Heading.types.h2}
        id="error-state-id"
        value="Failed to load subitems"
      />
      <Text>
        Something went wrong while loading subitems. Please try again later.
      </Text>
    </Flex>
  )

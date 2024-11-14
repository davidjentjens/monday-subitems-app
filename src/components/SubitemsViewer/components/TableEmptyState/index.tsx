import { Flex, Heading, Text } from 'monday-ui-react-core'

export const TableEmptyState: React.FC = () => (
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
      value="No subtitems yet for this item"
    />
    <Text>Be the first to add a subitem and start collaborating!</Text>
  </Flex>
)

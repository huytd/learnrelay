import * as React from 'react'
import * as GraphiQL from 'graphiql'
import * as CopyToClipboard from 'react-copy-to-clipboard'
import * as Relay from 'react-relay'
import Icon from '../Icon/Icon'

require('graphiql/graphiql.css')

interface Props {
  endpoint: string
  close: () => void
}

interface State {
  showData: boolean
}

class ServerLayover extends React.Component<Props, State> {

  state = {
    showData: false,
  }

  render() {
    console.log(this.props)
    const graphQLFetcher = (graphQLParams) => {
      return fetch(this.props.endpoint, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(graphQLParams),
      })
        .then(response => response.json())
    }

    return (
      <div className='fixed bottom-0 w-100 bg-gray-2' style={{ height: this.state.showData ? 350 : 550 }}>
        <div className='flex justify-between bg-accent' style={{ height: 70 }}>
          <div className='flex pt2'>
            <div
              className={`h-100 f4 flex items-center ph3 mh2 ${this.state.showData ? 'bg-gray-2 accent' : 'white'} `}
              onClick={() => this.setState({ showData: true } as State)}
            >
              Data Browser
            </div>
            <div
              className={`h-100 f4 flex items-center ph3 mh2 ${!this.state.showData ? 'bg-gray-2 accent' : 'white'} `}
              onClick={() => this.setState({ showData: false } as State)}
            >
              GraphiQL
            </div>
          </div>
          <div className='flex items-center p3'>
            <div className='o-30' style={{marginRight: 12}}>API Endpoint</div>
            <div className='flex items-center'>
              <CopyToClipboard text={this.props.endpoint}>
                <Icon src={require('../../assets/icons/copy.svg')}
                  className='dim'
                  style={{
                    padding: '6px',
                    background: 'rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                  }}
                />
              </CopyToClipboard>
              <div className='o-50' style={{background: 'rgba(0,0,0,0.05)', padding: '6px 12px'}}>{this.props.endpoint}</div>
            </div>
            <div
              className='white f2 pointer'
              onClick={this.props.close}
            >
              X
            </div>
          </div>
        </div>
        {this.state.showData &&
          <div>Aaaaaall the data.</div>
        }
        {!this.state.showData &&
          <div style={{height: 480}}>
            <GraphiQL fetcher={graphQLFetcher} />
          </div>
        }
      </div>
    )
  }
}

let LayoverContainer = Relay.createContainer(ServerLayover, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  }
})

export default class LayoverRenderer extends React.Component<Props, {}> {

  constructor(props) {
    super(props)

    Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer(this.props.endpoint))
  }

  render() {
    return (
      <Relay.Renderer
        {...this.props}
        Container={LayoverContainer}
        environment={Relay.Store}
        queryConfig={{
          name: '',
          queries: {viewer: () => Relay.QL`query { viewer }`},
          params: {},
        }}
        render={({done, error, props, retry, stale}) => {
          return <LayoverContainer {...this.props} />
        }}
      />
    )
  }
}

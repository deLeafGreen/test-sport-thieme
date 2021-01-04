import React from 'react';
import {render} from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { useQuery, gql } from '@apollo/client';
import { useForm } from "react-hook-form";

const GITHUB_BASE_URL = 'https://api.github.com/graphql';

const httpLink = new HttpLink({
    uri: GITHUB_BASE_URL,
    headers: {
        authorization: `Bearer ${
            'e9f294bb04821a25932718b32a82ec1f64b6530a'
        }`,
    },
});
const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
});



type repository = {
    login: String;
    repo: String;
}
export const RepositoryForm = () => {
    // @ts-ignore
    const {register,handleSubmit} = useForm<repository>();


    const onSubmit = (data: repository) => {
        render(<Issuer login={data.login} repository={data.repo}/>,document.getElementById('content'));

    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} id="repoForm">
            <div className="field">
                <label htmlFor="login">login</label>
                <input
                    type="text"
                    id="login"
                    name="login"
                    ref={register}
                />
            </div>
            <div className="field">
                <label htmlFor="repo">repository</label>
                <input
                    type="text"
                    id="repo"
                    name="repo"
                    ref={register}
                />
            </div>
            <input type="submit"/>
        </form>
    );
};




const GET_OPEN_ISSUES = gql`
    query GetIssues($login: String!, $repository: String!) {
        repositoryOwner(login: $login ) {
            id
            repository(name: $repository ) {
                id
                issues(first: 10,states: OPEN) {
                    edges{
                        node{
                            id
                            url
                            bodyHTML
                            comments(first:10){
                                edges{
                                    node{
                                        id
                                        bodyHTML
                                        reactions(first:10){
                                            edges{
                                                node{
                                                    id
                                                    content
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        }
                    }

                }

            }
        }
    }
`;
const GET_CLOSED_ISSUES = gql`
    query GetIssues($login: String!, $repository: String!) {
        repositoryOwner(login: $login ) {
            id
            repository(name: $repository ) {
                id
                issues(first: 10,states: CLOSED) {
                    edges{
                        node{
                            id
                            url
                            bodyHTML
                            comments(first:10){
                                edges{
                                    node{
                                        id
                                        bodyHTML
                                        reactions(first:10){
                                            edges{
                                                node{
                                                    id
                                                    content
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        }
                    }

                }

            }
        }
    }
`;

function IssueList( values: { login,repository }) {


    const { loading, error, data } = useQuery(GET_OPEN_ISSUES, {
        variables: { login: values.login, repository: values.repository }});

    if (loading) return <p>loading...</p>;
    if (error) return <p>${error}</p>;

    console.log(data);
    return (
        <table>
            <thead>
            <tr>
                <th>URL</th>
                <th>Text</th>
            </tr>
            </thead>
            <tbody>
            {data && data.repositoryOwner.repository.issues.edges.map(edge => (
                <tr>
                    <td>{edge.node.url}</td>
                    <td dangerouslySetInnerHTML={{__html:edge.node.bodyHTML}}></td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}



/*// @ts-ignore
export function IssueList({login,repository} ) {
    const l = login+"";
    const r = repository+"";
    console.log(l,r);
    const { loading, data } = useQuery<IssuesData, IssuesVars>(
        GET_OPEN_ISSUES, {variables: {login:l,repository:r} , pollInterval:500}
    );

    return (

        <div>
            <h3>Available Issues</h3>
            {loading ? (
                <p>Loading ...</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>URL</th>
                        <th>Text</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data && data.issues.map(node => (
                        <tr>
                            <td>{node.url}</td>
                            <td>{node.bodyHTML}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}*/


function Main() {

    return (
        <ApolloProvider client={client}>
            <div>
                <h2>My first Apollo app 🚀</h2>
                <RepositoryForm/>
            </div>
        </ApolloProvider>
    );
}

function Issuer(values ){

    return(<ApolloProvider client={client}>
        <div>
            <IssueList login={values.login.toString()} repository={values.repository.toString()} />
        </div>
    </ApolloProvider>);
}

render(<Main />, document.getElementById('root'));




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
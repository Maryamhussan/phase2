import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log('Received authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header provided');
      return new Response(JSON.stringify({ error: 'No valid authorization header provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.log('API URL not configured');
      return new Response(JSON.stringify({ error: 'API URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Forwarding request to:', `${apiUrl}/api/tasks`);

    // Make the request to the backend API, forwarding the Authorization header
    const response = await fetch(`${apiUrl}/api/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader, // Forward the original Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);

    // Return the response from the backend
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        // Forward any necessary headers from the backend response
        ...(response.headers.get('content-type') && { 'Content-Type': response.headers.get('content-type')! }),
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
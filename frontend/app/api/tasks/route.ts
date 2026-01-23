import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log('Received authorization header for tasks GET:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header provided for tasks GET');
      return new Response(JSON.stringify({ error: 'No valid authorization header provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.log('API URL not configured for tasks GET');
      return new Response(JSON.stringify({ error: 'API URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Forwarding GET request to:', `${apiUrl}/api/tasks`);

    // Make the request to the backend API, forwarding the Authorization header
    const response = await fetch(`${apiUrl}/api/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader, // Forward the original Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Backend response status for tasks GET:', response.status);

    // Check if the response has content before trying to parse JSON
    if (response.status === 204) {
      // No content response
      return new Response(null, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, return the text content
      const text = await response.text();
      return new Response(JSON.stringify({ message: text }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error for tasks GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log('Received authorization header for tasks POST:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header provided for tasks POST');
      return new Response(JSON.stringify({ error: 'No valid authorization header provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get request body
    const body = await request.json();

    // Get the API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.log('API URL not configured for tasks POST');
      return new Response(JSON.stringify({ error: 'API URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Forwarding POST request to:', `${apiUrl}/api/tasks`);

    // Make the request to the backend API, forwarding the Authorization header and body
    const response = await fetch(`${apiUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader, // Forward the original Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log('Backend response status for tasks POST:', response.status);

    // Check if the response has content before trying to parse JSON
    if (response.status === 204) {
      // No content response
      return new Response(null, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, return the text content
      const text = await response.text();
      return new Response(JSON.stringify({ message: text }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error for tasks POST:', error);
    return new Response(JSON.stringify({ error: 'Failed to create task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
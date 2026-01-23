import { NextRequest } from 'next/server';

// This API route handles task completion updates
// The route pattern is: /api/tasks/[id]/complete
// This will be matched by the file structure: app/api/tasks/[id]/complete/route.ts

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log(`Received authorization header for task ${id} completion PATCH:`, authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`No valid authorization header provided for task ${id} completion PATCH`);
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
      console.log(`API URL not configured for task ${id} completion PATCH`);
      return new Response(JSON.stringify({ error: 'API URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Forwarding PATCH request to:`, `${apiUrl}/api/tasks/${id}/complete`);

    // Make the request to the backend API for the completion endpoint
    const response = await fetch(`${apiUrl}/api/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader, // Forward the original Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log(`Backend response status for task ${id} completion PATCH:`, response.status);

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
    console.error(`Proxy error for task completion PATCH:`, error);
    return new Response(JSON.stringify({ error: 'Failed to update task completion' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
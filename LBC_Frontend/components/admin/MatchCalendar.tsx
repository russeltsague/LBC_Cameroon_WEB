'use client';

import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Modal, Form, Select, Input, DatePicker, TimePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const localizer = momentLocalizer(moment);

interface Team {
  _id: string;
  name: string;
  category: string;
  poule?: string;
}

interface Match extends Event {
  _id?: string;
  homeTeam: Team;
  awayTeam: Team;
  category: string;
  poule?: string;
  venue: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
}

export const MatchCalendarAdmin = () => {
  const [events, setEvents] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [poules, setPoules] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [generateForm] = Form.useForm();

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    fetchCategories();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('/api/matches');
      const matches = response.data.map((match: any) => ({
        ...match,
        title: `${match.homeTeam?.name || 'TBD'} vs ${match.awayTeam?.name || 'TBD'}`,
        start: new Date(match.date),
        end: moment(match.date).add(2, 'hours').toDate(),
      }));
      setEvents(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      message.error('Failed to load matches');
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSelectSlot = (slotInfo: any) => {
    setSelectedMatch(null);
    form.resetFields();
    form.setFieldsValue({
      date: moment(slotInfo.start),
      time: moment(slotInfo.start),
    });
    setIsModalVisible(true);
  };

  const handleSelectEvent = (event: Match) => {
    setSelectedMatch(event);
    form.setFieldsValue({
      homeTeam: event.homeTeam?._id,
      awayTeam: event.awayTeam?._id,
      category: event.category,
      poule: event.poule,
      venue: event.venue,
      date: moment(event.start),
      time: moment(event.start),
    });
    setIsModalVisible(true);
  };

  const handleGenerateSchedule = (values: any) => {
    // Call your backend API to generate the schedule
    // This is a placeholder - implement the actual API call
    console.log('Generating schedule with:', values);
    setIsGenerateModalVisible(false);
    message.success('Schedule generated successfully');
    fetchMatches(); // Refresh the matches
  };

  const handleSubmit = async (values: any) => {
    const matchData = {
      ...values,
      date: moment(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .toDate(),
    };

    try {
      if (selectedMatch?._id) {
        await axios.put(`/api/matches/${selectedMatch._id}`, matchData);
        message.success('Match updated successfully');
      } else {
        await axios.post('/api/matches', matchData);
        message.success('Match created successfully');
      }
      setIsModalVisible(false);
      fetchMatches();
    } catch (error) {
      console.error('Error saving match:', error);
      message.error('Failed to save match');
    }
  };

  const handleDelete = async () => {
    if (!selectedMatch?._id) return;
    
    try {
      await axios.delete(`/api/matches/${selectedMatch._id}`);
      message.success('Match deleted successfully');
      setIsModalVisible(false);
      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      message.error('Failed to delete match');
    }
  };

  const eventStyleGetter = (event: Match) => {
    let backgroundColor = '';
    switch (event.status) {
      case 'completed':
        backgroundColor = '#f6ffed';
        break;
      case 'postponed':
        backgroundColor = '#fffbe6';
        break;
      case 'cancelled':
        backgroundColor = '#fff1f0';
        break;
      default:
        backgroundColor = '#e6f7ff';
    }
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'black',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Match Calendar</h1>
        <div className="space-x-2">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedMatch(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Add Match
          </Button>
          <Button 
            type="default"
            onClick={() => setIsGenerateModalVisible(true)}
          >
            Generate Schedule
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          defaultView="month"
          views={['month', 'week', 'day', 'agenda']}
        />
      </div>

      {/* Add/Edit Match Modal */}
      <Modal
        title={selectedMatch ? 'Edit Match' : 'Add New Match'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          selectedMatch && (
            <Button key="delete" danger onClick={handleDelete}>
              <DeleteOutlined /> Delete
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {selectedMatch ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'scheduled',
          }}
        >
          <Form.Item
            name="homeTeam"
            label="Home Team"
            rules={[{ required: true, message: 'Please select home team' }]}
          >
            <Select placeholder="Select home team">
              {teams.map((team) => (
                <Select.Option key={team._id} value={team._id}>
                  {team.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="awayTeam"
            label="Away Team"
            rules={[{ required: true, message: 'Please select away team' }]}
          >
            <Select placeholder="Select away team">
              {teams.map((team) => (
                <Select.Option key={team._id} value={team._id}>
                  {team.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              {categories.map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="poule" label="Poule">
            <Select placeholder="Select poule (optional)" allowClear>
              {poules.map((poule) => (
                <Select.Option key={poule} value={poule}>
                  {poule}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: 'Please select time' }]}
          >
            <TimePicker format="HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item
            name="venue"
            label="Venue"
            rules={[{ required: true, message: 'Please enter venue' }]}
          >
            <Input placeholder="Enter venue" />
          </Form.Item>

          {selectedMatch && (
            <Form.Item name="status" label="Status">
              <Select>
                <Select.Option value="scheduled">Scheduled</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="postponed">Postponed</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
              </Select>
            </Form.Item>
          )}

          {selectedMatch?.status === 'completed' && (
            <>
              <Form.Item name="homeScore" label="Home Score">
                <Input type="number" min={0} />
              </Form.Item>
              <Form.Item name="awayScore" label="Away Score">
                <Input type="number" min={0} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* Generate Schedule Modal */}
      <Modal
        title="Generate Schedule"
        open={isGenerateModalVisible}
        onCancel={() => setIsGenerateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsGenerateModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="generate" 
            type="primary" 
            onClick={() => generateForm.submit()}
          >
            Generate
          </Button>,
        ]}
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={handleGenerateSchedule}
        >
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select 
              placeholder="Select category"
              onChange={(value) => {
                // Filter poules based on selected category
                const categoryPoules = Array.from(
                  new Set(
                    teams
                      .filter((team) => team.category === value && team.poule)
                      .map((team) => team.poule as string)
                  )
                );
                setPoules(categoryPoules);
                generateForm.setFieldsValue({ poule: undefined });
              }}
            >
              {categories.map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="poule" label="Poule (Optional)">
            <Select placeholder="Select poule (leave empty for all teams in category)">
              {poules.map((poule) => (
                <Select.Option key={poule} value={poule}>
                  {poule}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="daysBetweenMatches"
            label="Days Between Matches"
            initialValue={7}
          >
            <Input type="number" min={1} max={14} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MatchCalendarAdmin;

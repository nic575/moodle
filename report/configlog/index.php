<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Config changes report
 *
 * @package    report
 * @subpackage configlog
 * @copyright  2009 Petr Skoda
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__.'/../../config.php');
require_once($CFG->libdir.'/adminlib.php');

<<<<<<< OURS
// page parameters
$page    = optional_param('page', 0, PARAM_INT);
$perpage = optional_param('perpage', 30, PARAM_INT);    // how many per page
$sort    = optional_param('sort', 'timemodified', PARAM_ALPHA);
$dir     = optional_param('dir', 'DESC', PARAM_ALPHA);

admin_externalpage_setup('reportconfiglog', '', null, '', array('pagelayout'=>'report'));
echo $OUTPUT->header();

echo $OUTPUT->heading(get_string('configlog', 'report_configlog'));

$changescount = $DB->count_records('config_log');

$columns = array('firstname'    => get_string('firstname'),
                 'lastname'     => get_string('lastname'),
                 'timemodified' => get_string('timemodified', 'report_configlog'),
                 'plugin'       => get_string('plugin', 'report_configlog'),
                 'name'         => get_string('setting', 'report_configlog'),
                 'value'        => get_string('value', 'report_configlog'),
                 'oldvalue'     => get_string('oldvalue', 'report_configlog'),
                );
$hcolumns = array();


if (!isset($columns[$sort])) {
    $sort = 'lastname';
}

foreach ($columns as $column=>$strcolumn) {
    if ($sort != $column) {
        $columnicon = '';
        if ($column == 'lastaccess') {
            $columndir = 'DESC';
        } else {
            $columndir = 'ASC';
        }
    } else {
        $columndir = $dir == 'ASC' ? 'DESC':'ASC';
        if ($column == 'lastaccess') {
            $columnicon = $dir == 'ASC' ? 'up':'down';
        } else {
            $columnicon = $dir == 'ASC' ? 'down':'up';
        }
        $columnicon = $OUTPUT->pix_icon('t/' . $columnicon, '');

    }
    $hcolumns[$column] = "<a href=\"index.php?sort=$column&amp;dir=$columndir&amp;page=$page&amp;perpage=$perpage\">".$strcolumn."</a>$columnicon";
}

$baseurl = new moodle_url('index.php', array('sort' => $sort, 'dir' => $dir, 'perpage' => $perpage));
echo $OUTPUT->paging_bar($changescount, $page, $perpage, $baseurl);

$override = new stdClass();
$override->firstname = 'firstname';
$override->lastname = 'lastname';
$fullnamelanguage = get_string('fullnamedisplay', '', $override);
if (($CFG->fullnamedisplay == 'firstname lastname') or
    ($CFG->fullnamedisplay == 'firstname') or
    ($CFG->fullnamedisplay == 'language' and $fullnamelanguage == 'firstname lastname' )) {
    $fullnamedisplay = $hcolumns['firstname'].' / '.$hcolumns['lastname'];
} else { // ($CFG->fullnamedisplay == 'language' and $fullnamelanguage == 'lastname firstname')
    $fullnamedisplay = $hcolumns['lastname'].' / '.$hcolumns['firstname'];
}

$table = new html_table();
$table->head  = array($hcolumns['timemodified'], $fullnamedisplay, $hcolumns['plugin'], $hcolumns['name'], $hcolumns['value'], $hcolumns['oldvalue']);
$table->colclasses = array('leftalign date', 'leftalign name', 'leftalign plugin', 'leftalign setting', 'leftalign newvalue', 'leftalign originalvalue');
$table->id = 'configchanges';
$table->attributes['class'] = 'admintable generaltable';
$table->data  = array();

if ($sort == 'firstname' or $sort == 'lastname') {
    $orderby = "u.$sort $dir";
} else if ($sort == 'value' or $sort == 'oldvalue') {
    // cross-db text-compatible sorting.
    $orderby = $DB->sql_order_by_text("cl.$sort", 255) . ' ' . $dir;
} else {
    $orderby = "cl.$sort $dir";
}

$ufields = user_picture::fields('u');
$sql = "SELECT $ufields,
               cl.timemodified, cl.plugin, cl.name, cl.value, cl.oldvalue
          FROM {config_log} cl
          JOIN {user} u ON u.id = cl.userid
      ORDER BY $orderby";

$rs = $DB->get_recordset_sql($sql, array(), $page*$perpage, $perpage);
foreach ($rs as $log) {
    $row = array();
    $row[] = userdate($log->timemodified);
    $row[] = fullname($log);
    if (is_null($log->plugin)) {
        $row[] = 'core';
    } else {
        $row[] = $log->plugin;
    }
    $row[] = $log->name;
    $row[] = s($log->value);
    $row[] = s($log->oldvalue);

    $table->data[] = $row;
}
$rs->close();

echo html_writer::table($table);

echo $OUTPUT->footer();
=======
admin_externalpage_setup('reportconfiglog', '', null, '', array('pagelayout'=>'report'));

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('configlog', 'report_configlog'));

$mform = new \report_configlog\form\search();

/** @var cache_session $cache */
$cache = cache::make_from_params(cache_store::MODE_SESSION, 'report_customlog', 'search');
if ($cachedata = $cache->get('data')) {
    $mform->set_data($cachedata);
}

$searchclauses = [];

// Check if we have a form submission, or a cached submission.
$data = ($mform->is_submitted() ? $mform->get_data() : fullclone($cachedata));
if ($data instanceof stdClass) {
    if (!empty($data->value)) {
        $searchclauses[] = $data->value;
    }
    if (!empty($data->setting)) {
        $searchclauses[] = "setting:{$data->setting}";
    }
    if (!empty($data->user)) {
        $searchclauses[] = "user:{$data->user}";
    }
    if (!empty($data->datefrom)) {
        $searchclauses[] = "datefrom:{$data->datefrom}";
    }
    if (!empty($data->dateto)) {
        $dateto = $data->dateto + DAYSECS - 1;
        $searchclauses[] = "dateto:{$dateto}";
    }

    // Cache form submission so that it is preserved while paging through the report.
    unset($data->submitbutton);
    $cache->set('data', $data);
}

$mform->display();

$table = new \report_configlog\output\report_table(implode(' ', $searchclauses));
$table->define_baseurl($PAGE->url);

echo $PAGE->get_renderer('report_configlog')->render($table);

echo $OUTPUT->footer();
>>>>>>> THEIRS
